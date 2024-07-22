'use client';

import {Theme} from "@carbon/react";

export function Providers ({ children }: { children: React.ReactNode }) {
  return (
    <Theme theme="g100">
      {children}
    </Theme>
  );
}
