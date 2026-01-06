import * as React from "react";
import type { SVGProps } from "react";
const SvgUser = (props: SVGProps<SVGSVGElement>) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    fill="none"
    viewBox="-0.75 -0.75 24 24"
    width="1em"
    height="1em"
    aria-hidden="true"
    {...props}
  >
    <desc>{"User Streamline Icon: https://streamlinehq.com"}</desc>
    <g stroke="currentColor" strokeWidth={1.5}>
      <path d="M15.938 5.156c0 2.813-1.876 4.688-4.688 6.094-2.812-1.406-4.687-3.281-4.687-6.094v-3.75S7.969.47 11.25.47s4.688.937 4.688.937zM19.219 22.031l2.625-5.625s-3.563-2.812-10.594-2.812S.656 16.406.656 16.406l2.625 5.625z" />
    </g>
  </svg>
);
export default SvgUser;
