export const Colors = {
  dark: {
    text: "#fff",
    title: "#fff",
    background: "#252231",
    navBackground: "#201e2b",
    iconColor: "#9591a5",
    iconColorFocused: "#fff",
    uiBackground: "#BABABA",
    uploadEnabled: '#61849D',
    credContainer: '#d9d9d9',
    links: '#5AA8AC',

    primary: "#3C6E71", 
    warning: "#cc475a", 
  },
  light: {
    text: "#625f72",
    title: "#201e2b",
    background: "#FEFAE0",
    navBackground: "#283618",
    iconColor: "#CCD5AE",
    iconColorFocused: "#FAEDCD",
    uiBackground: "#C9A78F",
    uploadEnabled: '#432818',
    credContainer: '#C9A78F',
    links: '#618736',

    primary: "#99582A", 
    warning: '#9B0000', 
  },
}

// --- NEW: Debug log for Colors.js ---
console.log('Colors.js loaded. Light primary:', Colors.light.primary, 'Dark primary:', Colors.dark.primary);
