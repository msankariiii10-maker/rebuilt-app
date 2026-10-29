'use client';

// The Monthly / Yearly switch in the homepage "Start today" card.
// Yearly is shown as its monthly cost ($7.42 / month) so the saving is easy to see,
// and the button sends people to checkout with that plan already picked.

import { useState } from 'react';
import { PRICES, type Plan } from '@/lib/plans';

export default function PlanPicker() {
  const [plan, setPlan] = useState<Plan>('monthly');
  const yearly = plan === 'yearly';

  return (
    <>
      <div className="hm-toggle" role="group" aria-label="Billing">
        <button type="button" aria-pressed={!yearly} onClick={() => setPlan('monthly')}>
          Monthly
        </button>
        <button type="button" aria-pressed={yearly} onClick={() => setPlan('yearly')}>
          Yearly <span className="save">SAVE {PRICES.yearlySavePct}%</span>
        </button>
      </div>
      <div className="hm-price">
        {yearly ? PRICES.yearlyPerMonth : PRICES.monthly}
        <small>/ month</small>
      </div>
      <div className="hm-price-sub">
        {yearly ? (
          <>
            Billed <b>{PRICES.yearly}</b> once a year · save {PRICES.yearlySavePct}%
          </>
        ) : (
          'Billed monthly · cancel anytime'
        )}
      </div>
      <div className="hm-perks">
        <span>Progressive strength program</span>
        <span>Levels that grow with you</span>
        <span>Daily pain tracking</span>
        <span>Cancel anytime</span>
      </div>
      <a className="hm-btn" href={`/checkout?plan=${plan}`}>
        Join our community →
      </a>
    </>
  );
}
