import * as React from "react";
import type { SVGProps } from "react";
const SvgMeat = (props: SVGProps<SVGSVGElement>) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    fill="none"
    viewBox="-0.75 -0.75 24 24"
    width="1em"
    height="1em"
    aria-hidden="true"
    {...props}
  >
    <desc>{"Meat Streamline Icon: https://streamlinehq.com"}</desc>
    <path
      stroke="currentColor"
      strokeWidth={1.5}
      d="M.469 6.094v3.678c0 4.146 2.812 5.697 2.812 5.697h5.156c1.407 3.281 3.75 4.687 3.75 4.687h5.626s3.28-2.343 3.28-7.968v-3.75m0 0c0-5.626-3.28-7.97-3.28-7.97H3.28S.47 1.876.47 6.023s2.812 5.697 2.812 5.697h5.156c1.407 3.281 3.75 4.687 3.75 4.687h5.626s3.28-2.343 3.28-7.968Zm-4.218-5.626-7.5 7.5m9.844-2.343-6.094 6.094M9.844 2.342 3.75 8.439"
    />
  </svg>
);
export default SvgMeat;
