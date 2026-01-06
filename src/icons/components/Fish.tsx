import * as React from "react";
import type { SVGProps } from "react";
const SvgFish = (props: SVGProps<SVGSVGElement>) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    fill="none"
    viewBox="-0.75 -0.75 24 24"
    width="1em"
    height="1em"
    aria-hidden="true"
    {...props}
  >
    <desc>{"Fish Streamline Icon: https://streamlinehq.com"}</desc>
    <path
      stroke="currentColor"
      strokeWidth={1.5}
      d="M19.922 10.078a7.5 7.5 0 0 1-7.5-7.5m-5.18 15.235c7.908 0 14.319-6.411 14.319-14.32q-.002-1.208-.194-2.362a14.4 14.4 0 0 0-2.361-.193c-7.908 0-14.318 6.41-14.318 14.318l.001.213H.703a6.9 6.9 0 0 0 6.328 6.328V17.81z"
    />
  </svg>
);
export default SvgFish;
