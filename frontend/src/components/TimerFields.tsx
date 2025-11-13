import { useState, useEffect } from 'react';

interface TimerFieldsProps {
  actionId: number; // 2=Daily, 3=Annual Date, 4=Future Date
  data: string[];
  onDataChange: (data: string[]) => void;
}

export function TimerFields({ actionId, data, onDataChange }: TimerFieldsProps) {
  const [timeValue, setTimeValue] = useState(data[0] || '');
  const [dateValue, setDateValue] = useState(data[0] || '');
  const [daysValue, setDaysValue] = useState(data[0] || '');
  const [previewDate, setPreviewDate] = useState('');
  const [error, setError] = useState('');

  // Update preview for Future Date
  useEffect(() => {
    if (actionId === 4 && daysValue) {
      const days = parseInt(daysValue);
      if (!isNaN(days) && days >= 1 && days <= 365) {
        const futureDate = new Date();
        futureDate.setDate(futureDate.getDate() + days);
        setPreviewDate(futureDate.toLocaleDateString('en-US', { 
          weekday: 'long', 
          year: 'numeric', 
          month: 'long', 
          day: 'numeric' 
        }));
        setError('');
      } else if (days < 1 || days > 365) {
        setError('Days must be between 1 and 365');
        setPreviewDate('');
      } else {
        setPreviewDate('');
      }
    }
  }, [daysValue, actionId]);

  // Timer Daily (actionId = 2)
  if (actionId === 2) {
    const handleTimeChange = (value: string) => {
      setTimeValue(value);
      
      // Validate HH:MM format
      if (value && !/^([01]\d|2[0-3]):([0-5]\d)$/.test(value)) {
        setError('Invalid time format. Use HH:MM (00:00 to 23:59)');
      } else {
        setError('');
        onDataChange([value]);
      }
    };

    return (
      <div className="space-y-3">
        <div className="bg-cyan-500/10 border border-cyan-500/50 rounded-lg px-4 py-3">
          <p className="text-sm text-cyan-400">
            ⏰ This workflow will trigger <strong>every day</strong> at the specified time
          </p>
        </div>

        <div>
          <label htmlFor="timer-time" className="block text-xs font-medium text-gray-400 mb-1">
            Time (24-hour format) *
          </label>
          <input
            type="time"
            id="timer-time"
            value={timeValue}
            onChange={(e) => handleTimeChange(e.target.value)}
            className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
            required
          />
          <p className="mt-1 text-xs text-gray-500">
            Example: 09:30 will trigger at 9:30 AM every day
          </p>
          {error && (
            <p className="mt-1 text-xs text-red-400">{error}</p>
          )}
        </div>

        {timeValue && !error && (
          <div className="bg-green-500/10 border border-green-500/50 rounded-lg px-4 py-3">
            <p className="text-sm text-green-400">
              ✓ Will trigger daily at <strong>{timeValue}</strong>
            </p>
          </div>
        )}
      </div>
    );
  }

  // Timer Annual Date (actionId = 3)
  if (actionId === 3) {
    const handleDateChange = (value: string) => {
      setDateValue(value);
      
      // Convert YYYY-MM-DD to DD/MM format
      if (value) {
        const [year, month, day] = value.split('-');
        const ddMmFormat = `${day}/${month}`;
        
        // Validate DD/MM format
        if (!/^(0[1-9]|[12]\d|3[01])\/(0[1-9]|1[0-2])$/.test(ddMmFormat)) {
          setError('Invalid date format');
        } else {
          setError('');
          onDataChange([ddMmFormat]);
        }
      } else {
        onDataChange([]);
      }
    };

    return (
      <div className="space-y-3">
        <div className="bg-purple-500/10 border border-purple-500/50 rounded-lg px-4 py-3">
          <p className="text-sm text-purple-400">
            📅 This workflow will trigger <strong>every year</strong> on this date at midnight (00:00)
          </p>
        </div>

        <div>
          <label htmlFor="timer-date" className="block text-xs font-medium text-gray-400 mb-1">
            Date (Month/Day) *
          </label>
          <input
            type="date"
            id="timer-date"
            value={dateValue}
            onChange={(e) => handleDateChange(e.target.value)}
            className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            required
          />
          <p className="mt-1 text-xs text-gray-500">
            Example: December 25th will trigger every year on Christmas at midnight
          </p>
          {error && (
            <p className="mt-1 text-xs text-red-400">{error}</p>
          )}
        </div>

        {dateValue && !error && (
          <div className="bg-green-500/10 border border-green-500/50 rounded-lg px-4 py-3">
            <p className="text-sm text-green-400">
              ✓ Will trigger annually on <strong>{(() => {
                const [year, month, day] = dateValue.split('-');
                const date = new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
                return date.toLocaleDateString('en-US', { month: 'long', day: 'numeric' });
              })()}</strong> at 00:00
            </p>
          </div>
        )}
      </div>
    );
  }

  // Timer Future Date (actionId = 4)
  if (actionId === 4) {
    const handleDaysChange = (value: string) => {
      setDaysValue(value);
      
      const days = parseInt(value);
      if (value && (isNaN(days) || days < 1 || days > 365)) {
        setError('Days must be between 1 and 365');
        onDataChange([value]); // Still pass invalid value for validation
      } else {
        setError('');
        onDataChange([value]);
      }
    };

    return (
      <div className="space-y-3">
        <div className="bg-orange-500/10 border border-orange-500/50 rounded-lg px-4 py-3">
          <p className="text-sm text-orange-400">
            ⏳ This workflow will trigger <strong>once</strong> after the specified number of days
          </p>
        </div>

        <div>
          <label htmlFor="timer-days" className="block text-xs font-medium text-gray-400 mb-1">
            Number of Days *
          </label>
          <input
            type="number"
            id="timer-days"
            min="1"
            max="365"
            value={daysValue}
            onChange={(e) => handleDaysChange(e.target.value)}
            className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-orange-500 focus:border-transparent"
            placeholder="Enter number of days (1-365)"
            required
          />
          <p className="mt-1 text-xs text-gray-500">
            Example: 7 will trigger once, 7 days from now
          </p>
          {error && (
            <p className="mt-1 text-xs text-red-400">{error}</p>
          )}
        </div>

        {previewDate && !error && (
          <div className="bg-green-500/10 border border-green-500/50 rounded-lg px-4 py-3">
            <p className="text-sm text-green-400">
              ✓ Will trigger once on <strong>{previewDate}</strong>
            </p>
          </div>
        )}

        <div className="bg-yellow-500/10 border border-yellow-500/50 rounded-lg px-4 py-3">
          <p className="text-xs text-yellow-400">
            ⚠️ <strong>Note:</strong> This workflow will only trigger once. After it triggers, it will remain in your workflow list but won't trigger again.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-red-500/10 border border-red-500/50 rounded-lg px-4 py-3">
      <p className="text-sm text-red-400">
        ❌ Invalid Timer action type
      </p>
    </div>
  );
}
