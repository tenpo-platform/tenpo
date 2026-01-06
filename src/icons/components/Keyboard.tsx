import * as React from "react";
import type { SVGProps } from "react";
const SvgKeyboard = (props: SVGProps<SVGSVGElement>) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    fill="none"
    viewBox="-0.75 -0.75 24 24"
    width="1em"
    height="1em"
    aria-hidden="true"
    {...props}
  >
    <desc>{"Keyboard Streamline Icon: https://streamlinehq.com"}</desc>
    <path
      stroke="currentColor"
      strokeWidth={1.5}
      d="M8.438 15.469h5.624M3.75 11.719h2.344m1.875 0h2.343m1.876 0h2.343m1.875 0h2.344m-15-3.75h2.344m1.875 0h2.343m1.876 0h2.343m1.875 0h2.344M1.406 3.75h19.688s.937 2.5.937 7.5-.937 7.5-.937 7.5H1.406s-.937-2.5-.937-7.5.937-7.5.937-7.5Z"
    />
  </svg>
);
export default SvgKeyboard;
