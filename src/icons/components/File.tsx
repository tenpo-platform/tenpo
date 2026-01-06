import * as React from "react";
import type { SVGProps } from "react";
const SvgFile = (props: SVGProps<SVGSVGElement>) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    fill="none"
    viewBox="-0.75 -0.75 24 24"
    width="1em"
    height="1em"
    aria-hidden="true"
    {...props}
  >
    <desc>{"File Streamline Icon: https://streamlinehq.com"}</desc>
    <path
      stroke="currentColor"
      strokeWidth={1.5}
      d="M17.813 7.031h-4.688V.938M2.813.468v19.688s2.812 1.875 8.437 1.875 8.438-1.875 8.438-1.875V6.563C18.516 3.75 16.64 1.875 13.593.468z"
    />
  </svg>
);
export default SvgFile;
