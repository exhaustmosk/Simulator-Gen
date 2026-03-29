import { useEffect } from 'react';

export function useScrollObserver() {
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('is-visible');
            observer.unobserve(entry.target); // Animate only once per load
          }
        });
      },
      {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px',
      }
    );

    // Initial check for elements that match
    const hiddenElements = document.querySelectorAll('.animate-on-scroll');
    hiddenElements.forEach((el) => observer.observe(el));

    // MutationObserver to catch dynamically added elements (like when switching tabs/routes)
    const mutationObserver = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        mutation.addedNodes.forEach((node) => {
          if (node instanceof HTMLElement) {
            if (node.classList.contains('animate-on-scroll')) {
              observer.observe(node);
            }
            // Check children too
            const childHidden = node.querySelectorAll?.('.animate-on-scroll');
            if (childHidden) {
              childHidden.forEach((el) => observer.observe(el));
            }
          }
        });
      });
    });

    mutationObserver.observe(document.body, { childList: true, subtree: true });

    return () => {
      hiddenElements.forEach((el) => observer.unobserve(el));
      mutationObserver.disconnect();
    };
  }, []);
}
