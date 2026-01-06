import * as React from "react";
import type { SVGProps } from "react";
const SvgFolder = (props: SVGProps<SVGSVGElement>) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    fill="none"
    viewBox="-0.75 -0.75 24 24"
    width="1em"
    height="1em"
    aria-hidden="true"
    {...props}
  >
    <desc>{"Folder Streamline Icon: https://streamlinehq.com"}</desc>
    <path
      stroke="currentColor"
      strokeWidth={1.5}
      d="M.469 19.219V1.406h4.687s2.344.938 3.75 3.748h13.125V19.22s-3.281 1.875-10.781 1.875S.469 19.219.469 19.219Z"
    />
  </svg>
);
export default SvgFolder;
