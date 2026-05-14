const stroke = {
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 2,
  strokeLinecap: "round",
  strokeLinejoin: "round",
};

const wrap = (children) => (
  <svg viewBox="0 0 24 24" width="22" height="22" {...stroke} aria-hidden="true">
    {children}
  </svg>
);

export const IconHome = () =>
  wrap(<><path d="M3 11.5 12 4l9 7.5" /><path d="M5 10v10h14V10" /></>);
export const IconUsers = () =>
  wrap(<><circle cx="9" cy="8" r="3.5" /><path d="M2.5 20c.5-3.5 3.5-5.5 6.5-5.5s6 2 6.5 5.5" /><path d="M16 4.5a3.5 3.5 0 0 1 0 7" /><path d="M18 20c-.3-2.5-1.7-4-3.5-4.8" /></>);
export const IconDumbbell = () =>
  wrap(<><path d="M3 9v6" /><path d="M6 7v10" /><path d="M9 10h6" /><path d="M18 7v10" /><path d="M21 9v6" /></>);
export const IconPlus = () =>
  wrap(<><path d="M12 5v14" /><path d="M5 12h14" /></>);
export const IconList = () =>
  wrap(<><path d="M4 6h16" /><path d="M4 12h16" /><path d="M4 18h16" /></>);
export const IconChart = () =>
  wrap(<><path d="M4 20V8" /><path d="M10 20V4" /><path d="M16 20v-7" /><path d="M22 20H2" /></>);
export const IconRuler = () =>
  wrap(<><rect x="3" y="9" width="18" height="6" rx="1" /><path d="M7 9v3" /><path d="M11 9v4" /><path d="M15 9v3" /><path d="M19 9v4" /></>);
export const IconSearch = () =>
  wrap(<><circle cx="11" cy="11" r="7" /><path d="m21 21-4.3-4.3" /></>);
export const IconChevronRight = () =>
  wrap(<path d="m9 6 6 6-6 6" />);
export const IconChevronLeft = () =>
  wrap(<path d="m15 6-6 6 6 6" />);
export const IconCheck = () =>
  wrap(<path d="m5 12 5 5 9-12" />);
export const IconX = () =>
  wrap(<><path d="M6 6 18 18" /><path d="M18 6 6 18" /></>);
export const IconShare = () =>
  wrap(<><circle cx="6" cy="12" r="2.5" /><circle cx="18" cy="6" r="2.5" /><circle cx="18" cy="18" r="2.5" /><path d="m8 11 8-4" /><path d="m8 13 8 4" /></>);
export const IconLogout = () =>
  wrap(<><path d="M9 4H5a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h4" /><path d="m16 17 5-5-5-5" /><path d="M21 12H9" /></>);
export const IconCopy = () =>
  wrap(<><rect x="9" y="9" width="11" height="11" rx="2" /><path d="M5 15V5a2 2 0 0 1 2-2h10" /></>);
export const IconTrash = () =>
  wrap(<><path d="M4 7h16" /><path d="M10 11v6" /><path d="M14 11v6" /><path d="M6 7l1 13a2 2 0 0 0 2 2h6a2 2 0 0 0 2-2l1-13" /><path d="M9 7V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v3" /></>);
export const IconEdit = () =>
  wrap(<><path d="M4 20h4l10.5-10.5a2.83 2.83 0 0 0-4-4L4 16v4Z" /><path d="m14 6 4 4" /></>);
export const IconCalendar = () =>
  wrap(<><rect x="3" y="5" width="18" height="16" rx="2" /><path d="M3 9h18" /><path d="M8 3v4" /><path d="M16 3v4" /></>);
export const IconRun = () =>
  wrap(<><circle cx="14" cy="4.5" r="1.8" /><path d="m6 14 4-4 3 2 3-3 3 3" /><path d="m7 20 3-4" /><path d="m13 16 2 4" /></>);
