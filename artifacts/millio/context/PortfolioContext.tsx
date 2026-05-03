import AsyncStorage from "@react-native-async-storage/async-storage";
import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
import { generateId } from "@/utils/format";

export interface Silo {
  id: string;
  name: string;
  type: "cash" | "property" | "investment";
  currentValue: number;
  yearlyReturnRate: number;
  createdAt: string;
  recurringContribution?: number;
  notificationDay?: number;
  notificationId?: string;
}

export interface SiloUpdate {
  id: string;
  siloId: string;
  siloName: string;
  previousValue: number;
  newValue: number;
  delta: number;
  timestamp: string;
}

export interface EtaResult {
  months: number;
  arrivalDate: string | null;
}

export interface PendingMilestone {
  id: string;
  percentage: number;
  name: string;
  message: string;
}

export const MILESTONES: PendingMilestone[] = [
  { id: "m1", percentage: 1, name: "First Grain", message: "The chicken has started eating." },
  { id: "m10", percentage: 10, name: "10% Millionaire", message: "One tenth of the way. The silo is waking up." },
  { id: "m25", percentage: 25, name: "Quarter Harvest", message: "One quarter done. You're seriously doing this." },
  { id: "m50", percentage: 50, name: "Halfway There", message: "HALFWAY. Your silos are half full. Don't stop now." },
  { id: "m75", percentage: 75, name: "Almost Dangerous", message: "75% in. You can almost smell the harvest." },
  { id: "m90", percentage: 90, name: "Final Sprint", message: "90%! Last stretch. The million is right there." },
  { id: "m100", percentage: 100, name: "HARVEST TIME", message: "YOU DID IT. YOU ARE A MILLIONAIRE." },
];

interface PortfolioData {
  silos: Silo[];
  monthlyContribution: number;
  goal: number;
  updateHistory: SiloUpdate[];
  triggeredMilestones: string[];
}

interface PortfolioContextValue extends PortfolioData {
  isLoading: boolean;
  netWorth: number;
  percentToGoal: number;
  remainingToGoal: number;
  totalMonthlyContribution: number;
  eta: EtaResult;
  pendingMilestone: PendingMilestone | null;
  pendingHype: string | null;
  addSilo: (silo: Omit<Silo, "id" | "createdAt">) => string;
  updateSilo: (id: string, updates: Partial<Omit<Silo, "id" | "createdAt">>) => void;
  contributeSilo: (id: string, delta: number) => void;
  deleteSilo: (id: string) => void;
  setMonthlyContribution: (amount: number) => void;
  setGoal: (amount: number) => void;
  dismissMilestone: () => void;
  dismissHype: () => void;
}

const STORAGE_KEY = "millio_portfolio_v2";

function computeEta(
  silos: Silo[],
  monthlyContribution: number,
  goal: number
): EtaResult {
  const netWorth = silos.reduce((s, silo) => s + silo.currentValue, 0);
  if (netWorth >= goal) return { months: 0, arrivalDate: new Date().toISOString() };

  // Per-silo recurring contributions take precedence — they do NOT stack with the global amount.
  // The global monthlyContribution (set at onboarding) is a fallback for when no per-silo
  // recurring amounts are configured.
  const siloRecurring = silos.reduce((s, silo) => s + (silo.recurringContribution ?? 0), 0);
  const totalMonthly = siloRecurring > 0 ? siloRecurring : monthlyContribution;

  // Nothing to project if no current value and no contributions
  if (netWorth <= 0 && totalMonthly <= 0) return { months: -1, arrivalDate: null };

  // Blended monthly interest rate, weighted by each silo's current value.
  // Falls back to equal weighting if netWorth is 0 (pure contribution scenario).
  const blendedMonthlyRate = silos.reduce((sum, silo) => {
    const weight =
      netWorth > 0
        ? silo.currentValue / netWorth
        : 1 / Math.max(silos.length, 1);
    return sum + weight * (silo.yearlyReturnRate / 100 / 12);
  }, 0);

  // Simulate month by month: contributions ARE added to the compounding base each period,
  // so earlier contributions earn interest in subsequent months (standard annuity model).
  let total = netWorth;
  const MAX_MONTHS = 600;

  for (let month = 1; month <= MAX_MONTHS; month++) {
    total = total * (1 + blendedMonthlyRate) + totalMonthly;
    if (total >= goal) {
      const arrival = new Date();
      arrival.setMonth(arrival.getMonth() + month);
      return { months: month, arrivalDate: arrival.toISOString() };
    }
  }
  return { months: -1, arrivalDate: null };
}

function abbrev(amount: number): string {
  const abs = Math.abs(amount);
  if (abs >= 1_000_000) return `$${(abs / 1_000_000).toFixed(2)}M`;
  if (abs >= 1_000) return `$${(abs / 1_000).toFixed(1)}K`;
  return `$${abs.toFixed(0)}`;
}

function getHypeMessage(delta: number, eta: EtaResult, netWorth: number): string {
  const options: string[] = [
    `${abbrev(delta)} added to the harvest!`,
    `The grain keeps piling up. Don't stop!`,
    `Best update yet — the silo is full of momentum.`,
  ];
  if (eta.arrivalDate && eta.months > 0) {
    const d = new Date(eta.arrivalDate);
    const dateStr = d.toLocaleDateString("en-US", { month: "long", year: "numeric" });
    options.push(`At this pace, harvest is in ${dateStr}.`);
  }
  if (netWorth >= 500_000) {
    options.push("Over halfway there. The million can feel you coming.");
  }
  return options[Math.floor(Math.random() * options.length)];
}

const DEFAULT_DATA: PortfolioData = {
  silos: [],
  monthlyContribution: 0,
  goal: 1_000_000,
  updateHistory: [],
  triggeredMilestones: [],
};

const PortfolioContext = createContext<PortfolioContextValue | null>(null);

export function PortfolioProvider({ children }: { children: React.ReactNode }) {
  const [data, setData] = useState<PortfolioData>(DEFAULT_DATA);
  const [isLoading, setIsLoading] = useState(true);
  const [pendingMilestone, setPendingMilestone] = useState<PendingMilestone | null>(null);
  const [pendingHype, setPendingHype] = useState<string | null>(null);
  const prevNetWorth = useRef(0);

  useEffect(() => {
    AsyncStorage.getItem(STORAGE_KEY).then((raw) => {
      if (raw) {
        try {
          const parsed = JSON.parse(raw) as PortfolioData;
          setData(parsed);
          prevNetWorth.current = parsed.silos.reduce((s, silo) => s + silo.currentValue, 0);
        } catch {
          setData(DEFAULT_DATA);
        }
      }
      setIsLoading(false);
    });
  }, []);

  const persist = useCallback((next: PortfolioData) => {
    AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  }, []);

  const checkMilestones = useCallback((nextData: PortfolioData, newNetWorth: number) => {
    const pct = (newNetWorth / nextData.goal) * 100;
    for (const m of MILESTONES) {
      if (!nextData.triggeredMilestones.includes(m.id) && pct >= m.percentage) {
        return m;
      }
    }
    return null;
  }, []);

  const mutate = useCallback(
    (
      updater: (prev: PortfolioData) => PortfolioData,
      opts?: { checkHype?: boolean }
    ) => {
      setData((prev) => {
        const next = updater(prev);
        const newNetWorth = next.silos.reduce((s, silo) => s + silo.currentValue, 0);

        if (opts?.checkHype) {
          const delta = newNetWorth - prevNetWorth.current;
          if (delta > 0) {
            const eta = computeEta(next.silos, next.monthlyContribution, next.goal);
            const msg = getHypeMessage(delta, eta, newNetWorth);
            setTimeout(() => setPendingHype(msg), 400);
          }
        }

        const hitMilestone = checkMilestones(next, newNetWorth);
        if (hitMilestone) {
          const withMilestone: PortfolioData = {
            ...next,
            triggeredMilestones: [...next.triggeredMilestones, hitMilestone.id],
          };
          setTimeout(() => setPendingMilestone(hitMilestone), 800);
          prevNetWorth.current = newNetWorth;
          persist(withMilestone);
          return withMilestone;
        }

        prevNetWorth.current = newNetWorth;
        persist(next);
        return next;
      });
    },
    [checkMilestones, persist]
  );

  const addSilo = useCallback(
    (silo: Omit<Silo, "id" | "createdAt">): string => {
      const id = generateId();
      mutate((prev) => ({
        ...prev,
        silos: [
          ...prev.silos,
          { ...silo, id, createdAt: new Date().toISOString() },
        ],
      }));
      return id;
    },
    [mutate]
  );

  const updateSilo = useCallback(
    (id: string, updates: Partial<Omit<Silo, "id" | "createdAt">>) => {
      mutate((prev) => ({
        ...prev,
        silos: prev.silos.map((s) => (s.id === id ? { ...s, ...updates } : s)),
      }));
    },
    [mutate]
  );

  // Explicit contribution or withdrawal — always creates a transaction in history
  const contributeSilo = useCallback(
    (id: string, delta: number) => {
      mutate(
        (prev) => {
          const silo = prev.silos.find((s) => s.id === id);
          if (!silo) return prev;
          const newValue = Math.max(0, silo.currentValue + delta);
          const update: SiloUpdate = {
            id: generateId(),
            siloId: id,
            siloName: silo.name,
            previousValue: silo.currentValue,
            newValue,
            delta: newValue - silo.currentValue,
            timestamp: new Date().toISOString(),
          };
          return {
            ...prev,
            silos: prev.silos.map((s) =>
              s.id === id ? { ...s, currentValue: newValue } : s
            ),
            updateHistory: [update, ...prev.updateHistory],
          };
        },
        { checkHype: true }
      );
    },
    [mutate]
  );

  const deleteSilo = useCallback(
    (id: string) => {
      mutate((prev) => ({
        ...prev,
        silos: prev.silos.filter((s) => s.id !== id),
      }));
    },
    [mutate]
  );

  const setMonthlyContribution = useCallback(
    (amount: number) => {
      mutate((prev) => ({ ...prev, monthlyContribution: amount }));
    },
    [mutate]
  );

  const setGoal = useCallback(
    (amount: number) => {
      mutate((prev) => ({ ...prev, goal: amount }));
    },
    [mutate]
  );

  const dismissMilestone = useCallback(() => setPendingMilestone(null), []);
  const dismissHype = useCallback(() => setPendingHype(null), []);

  const netWorth = data.silos.reduce((s, silo) => s + silo.currentValue, 0);
  const percentToGoal = data.goal > 0 ? Math.min((netWorth / data.goal) * 100, 100) : 0;
  const remainingToGoal = Math.max(data.goal - netWorth, 0);
  const siloRecurringTotal = data.silos.reduce((s, silo) => s + (silo.recurringContribution ?? 0), 0);
  // Per-silo recurring takes precedence over global — they don't stack
  const totalMonthlyContribution =
    siloRecurringTotal > 0 ? siloRecurringTotal : data.monthlyContribution;
  const eta = computeEta(data.silos, data.monthlyContribution, data.goal);

  return (
    <PortfolioContext.Provider
      value={{
        ...data,
        isLoading,
        netWorth,
        percentToGoal,
        remainingToGoal,
        totalMonthlyContribution,
        eta,
        pendingMilestone,
        pendingHype,
        addSilo,
        updateSilo,
        contributeSilo,
        deleteSilo,
        setMonthlyContribution,
        setGoal,
        dismissMilestone,
        dismissHype,
      }}
    >
      {children}
    </PortfolioContext.Provider>
  );
}

export function usePortfolio(): PortfolioContextValue {
  const ctx = useContext(PortfolioContext);
  if (!ctx) throw new Error("usePortfolio must be used inside PortfolioProvider");
  return ctx;
}
