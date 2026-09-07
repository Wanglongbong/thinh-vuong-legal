'use client';

import { useEffect, useState } from 'react';

const customerNameKey = 'tv-legal-customer-name';
const customerNameEvent = 'tv:customer-name';

function normalizeName(value: string) {
  return value.replace(/\s+/g, ' ').trim().slice(0, 60);
}

export function useCustomerName() {
  const [name, setName] = useState('');
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const read = () => {
      setName(normalizeName(localStorage.getItem(customerNameKey) || ''));
      setReady(true);
    };
    const sync = (event: Event) =>
      setName(normalizeName((event as CustomEvent<string>).detail || ''));
    read();
    window.addEventListener(customerNameEvent, sync);
    return () => window.removeEventListener(customerNameEvent, sync);
  }, []);

  function remember(value: string) {
    const normalized = normalizeName(value);
    if (!normalized) return false;
    localStorage.setItem(customerNameKey, normalized);
    setName(normalized);
    window.dispatchEvent(
      new CustomEvent(customerNameEvent, { detail: normalized }),
    );
    return true;
  }

  function forget() {
    localStorage.removeItem(customerNameKey);
    setName('');
    window.dispatchEvent(new CustomEvent(customerNameEvent, { detail: '' }));
  }

  return { name, ready, remember, forget };
}
