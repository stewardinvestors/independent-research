export const GA_MEASUREMENT_ID = "G-TT1DKH7JHY";

type GTagEvent = {
  action: string;
  category?: string;
  label?: string;
  value?: number;
  [key: string]: string | number | undefined;
};

export const event = ({ action, ...params }: GTagEvent) => {
  if (typeof window !== "undefined" && typeof window.gtag === "function") {
    window.gtag("event", action, params);
  }
};
