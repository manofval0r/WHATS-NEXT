"""
Views, split by domain.

Each module owns one area of the product. They import from each other where
a domain genuinely spans another (community needs the roadmap's models,
jada needs profile context), but there are no circular imports because the
dependency direction is always toward ``models``, ``activity``, ``xp`` and
the other leaf services.
"""
