export type UltraAppConfig = {
  appName: string;
  commerce: {
    defaultCurrency: string;
    defaultRegion: string;
  };
  features: {
    analytics: boolean;
    signups: boolean;
  };
  storage: {
    driver: "memory" | "s3";
  };
  analytics: {
    googleAnalytics: {
      enabled: boolean;
      measurementId: string;
    };
    facebookPixel: {
      enabled: boolean;
      pixelId: string;
    };
    metaConversionsApi: {
      enabled: boolean;
      testEventCode: string;
    };
  };
  email: {
    provider: "console" | "resend";
    defaults: {
      from: string;
      replyTo?: string;
    };
    resend: {
      audienceId: string;
      inboundDomain?: string;
      inboundAddress?: string;
    };
  };
};

const appConfig: UltraAppConfig = {
  appName: "Ultra Commerce",
  commerce: {
    defaultCurrency: "USD",
    defaultRegion: "global",
  },
  features: {
    analytics: true,
    signups: true,
  },
  storage: {
    driver: "memory",
  },
  analytics: {
    googleAnalytics: {
      enabled: false,
      measurementId: "",
    },
    facebookPixel: {
      enabled: false,
      pixelId: "",
    },
    metaConversionsApi: {
      enabled: false,
      testEventCode: "",
    },
  },
  email: {
    provider: "console",
    defaults: {
      from: "Ultra Commerce <no-reply@example.com>",
    },
    resend: {
      audienceId: "",
    },
  },
};

export function getAppConfig(): Readonly<UltraAppConfig> {
  return Object.freeze(structuredClone(appConfig));
}
