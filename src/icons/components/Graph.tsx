import * as React from "react";
import type { SVGProps } from "react";
const SvgGraph = (props: SVGProps<SVGSVGElement>) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    fill="none"
    viewBox="-0.75 -0.75 24 24"
    width="1em"
    height="1em"
    aria-hidden="true"
    {...props}
  >
    <desc>{"Graph Streamline Icon: https://streamlinehq.com"}</desc>
    <path
      stroke="currentColor"
      strokeWidth={1.5}
      d="M14.766 20.86V7.957s-1.172-.692-3.516-.692-3.516.692-3.516.692v12.901m7.032 0H7.734m7.032 0h7.03V2.332s-1.171-.691-3.515-.691-3.515.692-3.515.692zm-7.032 0v-7.277s-1.171-.691-3.515-.691-3.516.692-3.516.692v7.276z"
    />
  </svg>
);
export default SvgGraph;
