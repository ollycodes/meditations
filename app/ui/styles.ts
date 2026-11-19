// Shared class names so every card, button and chip follows the same pattern:
// warm orange cards on the amber background, emerald for "go", pink for
// "stop", indigo for the running clock.

export const card = 'bg-orange-100 border-2 border-orange-200 rounded-lg';

export const softButton =
  'bg-orange-50 hover:bg-orange-200 active:bg-orange-300 ' +
  'border-2 border-orange-200 rounded-lg transition-colors ' +
  'disabled:hover:bg-orange-50 disabled:cursor-not-allowed';

export const startButton =
  'bg-emerald-100 hover:bg-emerald-200 active:bg-emerald-300 ' +
  'border-2 border-emerald-200 rounded-lg transition-colors';

export const chip = (selected: boolean) =>
  `py-2 rounded-lg border-2 text-sm transition-colors ${selected
    ? 'bg-orange-300 border-orange-400'
    : 'bg-orange-50 border-orange-200 hover:bg-orange-200 active:bg-orange-300'}`;

export const divider = 'border-t-2 border-orange-200';
