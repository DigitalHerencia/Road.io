# Drivers Module

This module manages driver information and operations. It now includes an advanced communication system and mobile offline support.

## Driver Communication

- `driver_messages` table stores messages between dispatchers and drivers.
- `sendDriverMessage` server action validates and saves messages.
- `fetchDriverMessages` fetcher returns recent messages for a driver.
- `DriverMessageList` displays message history.
- `DriverMessageForm` allows drivers to send messages and queues them offline when the device is not connected.

## Mobile Offline Support

The message form stores unsent messages in `localStorage` and automatically sends them when the device reconnects. This ensures drivers can compose messages without connectivity.
