# Eye Care Theme

This plugin adds a global eye-care tint overlay for SiYuan, compatible with default and third-party themes.

## Features

- Global toggle, with a configurable hotkey
- Presets: Soft yellow / Soft green / Soft gray
- Custom tint color (HEX or RGB) and strength control
- Smart time mode (auto enable/disable based on system time)
- Import/export settings JSON
- Settings persistence via SiYuan storage (sync-friendly)

## Installation

1. Package this folder as a `.zip`
2. Install it via SiYuan → Settings → Bazaar → Plugins → Install from local package

## Usage

- Hotkey: use the command “Toggle eye-care mode” and set your preferred hotkey in SiYuan keymap settings.
- Settings: open “Eye-care settings” from plugin settings panel.

## Settings JSON format

Exported file is a JSON object like:

- `config`: current configuration
- `schemes`: optional custom schemes list (future-proof)

## Notes

- The implementation works by blending your current theme variables with a tint color; it does not replace your theme.
- Transition duration is limited to 250ms for smooth switching.
