import helpData from "./pages.json";

/**
 * Get help content for a page.
 * @param {string} pageName - key in pages.json (e.g. "Retirement")
 * @returns {{ title: string, sections: Array<{heading: string, content: string}> } | null}
 */
export function getPageHelp(pageName) {
  return helpData[pageName] || null;
}

export default getPageHelp;
