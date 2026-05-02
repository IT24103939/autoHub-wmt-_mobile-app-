# Architecture Notes

## Roles

- User: browses garages, browses spare parts, places orders
- Garage Owner: manages garage profile and services
- Spare Part Supplier: manages spare parts inventory

## Main Modules

- Auth module (login/register, role management)
- Garage module (list/detail/create/update)
- Spare parts module (list/detail/create/update)
- Cart and order module
- Profile module

## Data Models

See `src/types/models.ts`.

## API Layer

Use `src/services/api/client.ts` as the base network client.
