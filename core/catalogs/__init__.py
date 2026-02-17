"""
Career-path catalog package.
Each sub-module exports a single dict constant following the role template schema.
"""

from .fullstack_developer import FULL_STACK_DEVELOPER
from .frontend_developer import FRONTEND_DEVELOPER
from .backend_developer import BACKEND_DEVELOPER
from .data_scientist import DATA_SCIENTIST
from .devops_engineer import DEVOPS_ENGINEER
from .mobile_developer import MOBILE_DEVELOPER

__all__ = [
    "FULL_STACK_DEVELOPER",
    "FRONTEND_DEVELOPER",
    "BACKEND_DEVELOPER",
    "DATA_SCIENTIST",
    "DEVOPS_ENGINEER",
    "MOBILE_DEVELOPER",
]
