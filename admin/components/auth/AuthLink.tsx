"use client";

import React from "react";

interface Props extends Omit<React.ComponentProps<"a">, "href"> {
  href: string;
}

// Links between the auth screens (sign in / register / forgot password).
// Deliberately NOT next/link: a soft navigation to /signin or /register gets
// caught by the app/@modal intercepting routes and opens a modal ON TOP of
// the current auth page (which then shows blurred behind it). A real
// navigation skips interception and renders the target as a full page, and
// location.replace() keeps the auth screens from piling up in history.
const AuthLink = ({ href, onClick, ...props }: Props) => (
  <a
    href={href}
    onClick={(e) => {
      onClick?.(e);
      if (
        e.defaultPrevented ||
        e.button !== 0 ||
        e.metaKey ||
        e.ctrlKey ||
        e.shiftKey ||
        e.altKey
      )
        return;
      e.preventDefault();
      window.location.replace(href);
    }}
    {...props}
  />
);

export default AuthLink;
