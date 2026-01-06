import * as React from "react";
import type { SVGProps } from "react";
const SvgNotification = (props: SVGProps<SVGSVGElement>) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    fill="none"
    viewBox="-0.75 -0.75 24 24"
    width="1em"
    height="1em"
    aria-hidden="true"
    {...props}
  >
    <desc>{"Notification Streamline Icon: https://streamlinehq.com"}</desc>
    <path
      stroke="currentColor"
      strokeWidth={1.5}
      d="M8.557 20.625a3.28 3.28 0 0 0 2.692 1.406c1.116 0 2.1-.556 2.694-1.406m-2.693-1.406c-7.547 0-10.547-2.157-10.547-2.157l2.578-3L3.282 9.6c0-.773.03-1.554.31-2.276.617-1.583 2.427-4.537 7.658-6.76 5.235 2.224 7.042 5.18 7.657 6.762.28.72.31 1.5.31 2.272v4.466l2.58 3s-3 2.156-10.547 2.156Z"
    />
  </svg>
);
export default SvgNotification;
