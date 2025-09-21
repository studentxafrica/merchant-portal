import type { Config } from "tailwindcss";

export default {
	darkMode: ["class"],
	content: [
		"./pages/**/*.{ts,tsx}",
		"./components/**/*.{ts,tsx}",
		"./app/**/*.{ts,tsx}",
		"./src/**/*.{ts,tsx}",
	],
	prefix: "",
	theme: {
		container: {
			center: true,
			padding: '2rem',
			screens: {
				'2xl': '1400px'
			}
		},
		extend: {
			colors: {
				// border: 'hsl(var(--border))',
				input: 'hsl(var(--input))',
				ring: 'hsl(var(--ring))',
				// background: 'hsl(var(--background))',
				foreground: 'hsl(var(--foreground))',
				brand: {
					primary: '#DB0271',       // Vibrant pink
					secondary: '#0000EE',    // Classic blue
					accent: '#148CFC',       // Bright blue
					danger: '#C72310',      // Alert red
				},

				// Neutral colors
				neutral: {
					darkest: '#000000', // Black
					darker: '#161616', // Dark gray
					dark: '#262628', // Gray 
					medium: '#596168', // Medium gray
					light: '#4C5359', // Light gray
					lighter: '#D8D8D8', // Light gray
					lightest: '#E2E2E2', // Very light gray
				},

				// Background colors
				background: {
					DEFAULT: '#FFFFFF', // White
					light: '#FEFEFE', // Off-white
					lighter: '#FAFBFC', // Very light gray
					subtle: '#F4F4F4', // Light gray
					muted: '#F0F4F8', // Soft gray
					soft: '#E1E9F0', // Soft blue-gray
					softer: '#E0E9F0', // Very soft blue-gray
				},

				// Text colors
				text: {
					primary: '#262628', // Dark gray
					secondary: '#596168', // Medium gray
					tertiary: '#4C5359', // Light gray
					inverted: '#FFFFFF', // White
					link: '#0000EE', // Classic blue
					hover: '#148CFC', // Bright blue
					danger: '#C72310', // Alert red
				},

				// Border colors
				border: {
					DEFAULT: '#E6E6E6', // Light gray
					strong: '#D8D8D8', // Medium gray
					subtle: '#F0F4F8', // Soft gray
					accent: '#148CFC', // Bright blue
					danger: '#C72310', // Alert red
				},
				primary: {
					DEFAULT: 'hsl(var(--primary))',
					foreground: 'hsl(var(--primary-foreground))'
				},
				secondary: {
					DEFAULT: 'hsl(var(--secondary))',
					foreground: 'hsl(var(--secondary-foreground))'
				},
				destructive: {
					DEFAULT: 'hsl(var(--destructive))',
					foreground: 'hsl(var(--destructive-foreground))'
				},
				muted: {
					DEFAULT: 'hsl(var(--muted))',
					foreground: 'hsl(var(--muted-foreground))'
				},
				accent: {
					DEFAULT: 'hsl(var(--accent))',
					foreground: 'hsl(var(--accent-foreground))'
				},
				popover: {
					DEFAULT: 'hsl(var(--popover))',
					foreground: 'hsl(var(--popover-foreground))'
				},
				card: {
					DEFAULT: 'hsl(var(--card))',
					foreground: 'hsl(var(--card-foreground))'
				},
				sidebar: {
					DEFAULT: 'hsl(var(--sidebar-background))',
					foreground: 'hsl(var(--sidebar-foreground))',
					primary: 'hsl(var(--sidebar-primary))',
					'primary-foreground': 'hsl(var(--sidebar-primary-foreground))',
					accent: 'hsl(var(--sidebar-accent))',
					'accent-foreground': 'hsl(var(--sidebar-accent-foreground))',
					border: 'hsl(var(--sidebar-border))',
					ring: 'hsl(var(--sidebar-ring))'
				}
			},
			borderRadius: {
				lg: 'var(--radius)',
				md: 'calc(var(--radius) - 2px)',
				sm: 'calc(var(--radius) - 4px)'
			},
			keyframes: {
				'accordion-down': {
					from: {
						height: '0'
					},
					to: {
						height: 'var(--radix-accordion-content-height)'
					}
				},
				'accordion-up': {
					from: {
						height: 'var(--radix-accordion-content-height)'
					},
					to: {
						height: '0'
					}
				}
			},
			animation: {
				'accordion-down': 'accordion-down 0.2s ease-out',
				'accordion-up': 'accordion-up 0.2s ease-out'
			}
		}
	},
	plugins: [require("tailwindcss-animate")],
} satisfies Config;
