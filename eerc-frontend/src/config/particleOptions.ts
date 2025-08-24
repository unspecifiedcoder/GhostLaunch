import type { ISourceOptions } from "tsparticles-engine";

export const particleOptions: ISourceOptions = {
  background: {
    color: {
      value: '#0d1117',
    },
  },
  fullScreen: {
    enable: true,
    zIndex: -1,
  },
  fpsLimit: 60,
  interactivity: {
    events: {
      onHover: {
        enable: true,
        mode: "repulse",
      },
      resize: true,
    },
    modes: {
      repulse: {
        distance: 100,
        duration: 0.4,
      },
    },
  },
  particles: {
    color: {
      value: ["#ff00ff", "#9c27b0", "#00d5ff", "#ffffff"],
    },
    links: {
      enable: false,
    },
    move: {
      direction: "none",
      enable: true,
      outModes: {
        default: "out",
      },
      random: true,
      speed: 1,
      straight: false,
    },
    number: {
      density: {
        enable: true,
        area: 800,
      },
      value: 40,
    },
    opacity: {
      value: { min: 0.4, max: 0.9 },
    },
    shape: {
      type: "char",
      character: {
        value: ["✨", "✦", "✧", "⭐"],
        font: "Verdana",
        style: "",
        weight: "400",
        fill: true,
      },
    },
    size: {
      value: { min: 8, max: 16 },
    },
  },
  detectRetina: true,
};