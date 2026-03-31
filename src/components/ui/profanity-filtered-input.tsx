import * as React from 'react';
import { useProfanityFilter } from '@/hooks/useProfanityFilter';
import { cn } from '@/lib/utils';

type BaseProps = {
  onProfanityDetected?: (hasProfanity: boolean) => void;
  filterEnabled?: boolean;
  className?: string;
};

type InputProps = BaseProps & {
  as?: 'input';
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
} & Omit<React.InputHTMLAttributes<HTMLInputElement>, 'onChange'>;

type TextareaProps = BaseProps & {
  as: 'textarea';
  onChange?: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
} & Omit<React.TextareaHTMLAttributes<HTMLTextAreaElement>, 'onChange'>;

type ProfanityFilteredInputProps = InputProps | TextareaProps;

const ProfanityFilteredInput = React.forwardRef<
  HTMLInputElement | HTMLTextAreaElement,
  ProfanityFilteredInputProps
>(({
  className,
  onChange,
  onProfanityDetected,
  filterEnabled = true,
  as: Component = 'input',
  ...rest
}, ref) => {
  const { validateInput, hasProfanity, checkProfanity } = useProfanityFilter();

  // Handle input changes
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { value } = e.target;
    
    if (!filterEnabled) {
      (onChange as ((e: React.ChangeEvent<HTMLInputElement>) => void))?.(e);
      return;
    }

    // Always filter the input, but only show warning for explicit profanity
    const filteredText = validateInput(value);
    const containsProfanity = checkProfanity(value);
    
    // Update profanity detection state
    onProfanityDetected?.(containsProfanity);

    // Create new event with filtered text
    const newEvent = {
      ...e,
      target: {
        ...e.target,
        value: containsProfanity ? filteredText : value,
        id: (rest as any).id ?? e.target.id,
      },
    } as React.ChangeEvent<HTMLInputElement>;
    
    // Update the input value directly for immediate feedback
    if (e.target) {
      e.target.value = containsProfanity ? filteredText : value;
    }
    
    // Call the original handler with the new event
    (onChange as ((e: React.ChangeEvent<HTMLInputElement>) => void))?.(newEvent);
  };

  // Handle textarea changes
  const handleTextareaChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const { value } = e.target;
    
    if (!filterEnabled) {
      (onChange as ((e: React.ChangeEvent<HTMLTextAreaElement>) => void))?.(e);
      return;
    }

    // Always filter the input, but only show warning for explicit profanity
    const filteredText = validateInput(value);
    const containsProfanity = checkProfanity(value);
    
    // Update profanity detection state
    onProfanityDetected?.(containsProfanity);

    // Create new event with filtered text
    const newEvent = {
      ...e,
      target: {
        ...e.target,
        value: containsProfanity ? filteredText : value,
        id: (rest as any).id ?? e.target.id,
      },
    } as React.ChangeEvent<HTMLTextAreaElement>;
    
    // Update the textarea value directly for immediate feedback
    if (e.target) {
      e.target.value = containsProfanity ? filteredText : value;
    }
    
    // Call the original handler with the new event
    (onChange as ((e: React.ChangeEvent<HTMLTextAreaElement>) => void))?.(newEvent);
  };

  const baseClasses = 'flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50';
  const inputClasses = cn(
    baseClasses,
    'file:border-0 file:bg-transparent file:text-sm file:font-medium',
    className,
    {
      'border-red-500 focus-visible:ring-red-500': hasProfanity,
      'min-h-[80px]': Component === 'textarea',
    }
  );

  const commonProps = {
    className: inputClasses,
  };

  if (Component === 'textarea') {
    return (
      <div className="relative w-full">
        <textarea
          ref={ref as React.ForwardedRef<HTMLTextAreaElement>}
          id={(rest as any).id}
          onChange={handleTextareaChange}
          {...commonProps}
          {...(rest as React.TextareaHTMLAttributes<HTMLTextAreaElement>)}
          rows={4}
        />
        {hasProfanity && (
          <p className="mt-1 text-xs text-red-500">
            Inappropriate language has been filtered out.
          </p>
        )}
      </div>
    );
  }

  return (
    <div className="relative w-full">
      <input
        ref={ref as React.ForwardedRef<HTMLInputElement>}
        id={(rest as any).id}
        type={(rest as React.InputHTMLAttributes<HTMLInputElement>).type || 'text'}
        onChange={handleInputChange}
        {...commonProps}
        {...(rest as React.InputHTMLAttributes<HTMLInputElement>)}
      />
      {hasProfanity && (
        <p className="mt-1 text-xs text-red-500">
          Inappropriate language has been filtered out.
        </p>
      )}
    </div>
  );
});

ProfanityFilteredInput.displayName = 'ProfanityFilteredInput';

export { ProfanityFilteredInput };
export default ProfanityFilteredInput;
