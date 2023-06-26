import React from 'react';
import { useNavigate } from 'react-router-dom';

// Wraps navigate hook into an HOC.
export function withNavigate<T>(Component: React.ComponentType<T>) {
  return function wrappedComponent(props: T) {
    const navigate = useNavigate();
    return <Component { ...{ ...props, navigate: navigate } } />;
  };
}