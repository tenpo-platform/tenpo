import * as React from "react";
import type { SVGProps } from "react";
const SvgMuteNotification = (props: SVGProps<SVGSVGElement>) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    fill="none"
    viewBox="-0.75 -0.75 24 24"
    width="1em"
    height="1em"
    aria-hidden="true"
    {...props}
  >
    <desc>{"Mute Notification Streamline Icon: https://streamlinehq.com"}</desc>
    <path
      stroke="currentColor"
      strokeWidth={1.5}
      d="M.469.469 22.03 22.03m-3.618-3.618c2.358-.614 3.384-1.35 3.384-1.35l-2.578-3-.002-4.466c0-.772-.03-1.552-.31-2.272-.614-1.583-2.422-4.538-7.657-6.762-3.2 1.359-5.119 2.993-6.27 4.418m11.426 13.85c-1.406.23-3.115.388-5.156.388-7.547 0-10.547-2.157-10.547-2.157l2.578-3L3.282 9.6c0-.773.03-1.554.31-2.276.089-.227.202-.483.346-.76m4.619 14.062a3.28 3.28 0 0 0 2.692 1.406c1.116 0 2.1-.556 2.694-1.406"
    />
  </svg>
);
export default SvgMuteNotification;
