'use client';

import { useEffect } from 'react';
import { ensureSeedData } from '@/lib/storage';

export default function SeedProvider() {
  useEffect(() => {
    ensureSeedData();
  }, []);
  return null;
}
