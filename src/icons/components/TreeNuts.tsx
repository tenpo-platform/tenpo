import * as React from "react";
import type { SVGProps } from "react";
const SvgTreeNuts = (props: SVGProps<SVGSVGElement>) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    fill="none"
    viewBox="-0.75 -0.75 24 24"
    width="1em"
    height="1em"
    aria-hidden="true"
    {...props}
  >
    <desc>{"Tree Nuts Streamline Icon: https://streamlinehq.com"}</desc>
    <path
      stroke="currentColor"
      strokeWidth={1.5}
      d="M19.219 11.25v.422c0 4.781-3.188 7.875-7.969 10.266-4.781-2.391-7.969-5.485-7.969-10.266v-.422M15 9.553a21 21 0 0 0 1.875-.384m-5.625.675q.986-.002 1.875-.071m0-2.813c.668-.05 1.294-.127 1.875-.22M8.906 1.407l1.005 1.508a8.88 8.88 0 0 0-7.303 6.743l-.264 1.124s3.281 1.875 8.906 1.875 8.906-1.875 8.906-1.875l-.264-1.125a8.88 8.88 0 0 0-7.303-6.742l1.005-1.508S12.656.47 11.25.47s-2.344.937-2.344.937Z"
    />
  </svg>
);
export default SvgTreeNuts;
