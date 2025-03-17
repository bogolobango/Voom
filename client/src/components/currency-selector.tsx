import React from 'react';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useCurrency } from '@/hooks/use-currency';
import { CurrencyType } from '@/lib/utils';
import { Button } from './ui/button';
import { DollarSign } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

interface CurrencySelectorProps {
  variant?: 'select' | 'dropdown' | 'minimal';
  className?: string;
}

export function CurrencySelector({ variant = 'select', className = '' }: CurrencySelectorProps) {
  const { currency, setCurrency } = useCurrency();
  
  const currencies: { value: CurrencyType; label: string; symbol: string }[] = [
    { value: 'FCFA', label: 'CFA Franc', symbol: 'FCFA' },
    { value: 'GHS', label: 'Ghana Cedi', symbol: '₵' },
    { value: 'USD', label: 'US Dollar', symbol: '$' }
  ];

  if (variant === 'select') {
    return (
      <div className={className}>
        <Select
          value={currency}
          onValueChange={(value: CurrencyType) => setCurrency(value)}
        >
          <SelectTrigger className="w-[130px]">
            <SelectValue placeholder="Select currency" />
          </SelectTrigger>
          <SelectContent>
            {currencies.map((curr) => (
              <SelectItem key={curr.value} value={curr.value}>
                {curr.symbol} {curr.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    );
  }
  
  if (variant === 'dropdown') {
    return (
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" size="sm" className={className}>
            <DollarSign className="h-4 w-4 mr-1" />
            {currencies.find(c => c.value === currency)?.symbol || currency}
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent>
          {currencies.map((curr) => (
            <DropdownMenuItem 
              key={curr.value}
              onClick={() => setCurrency(curr.value)}
              className={currency === curr.value ? "bg-accent" : ""}
            >
              {curr.symbol} {curr.label}
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>
    );
  }
  
  // Minimal variant
  return (
    <div className={`flex items-center space-x-2 ${className}`}>
      {currencies.map((curr) => (
        <Button
          key={curr.value}
          variant={currency === curr.value ? "default" : "outline"}
          size="sm"
          onClick={() => setCurrency(curr.value)}
        >
          {curr.symbol}
        </Button>
      ))}
    </div>
  );
}