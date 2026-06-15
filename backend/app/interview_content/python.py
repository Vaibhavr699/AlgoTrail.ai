QUESTIONS = [
    {
        "slug": "py-is-vs-eq",
        "question": "What is the difference between `is` and `==` in Python?",
        "difficulty": "EASY",
        "tldr": "`==` compares values; `is` compares identity (same object in memory).",
        "explanation": (
            "`==` calls `__eq__` and compares values. `is` checks whether two names "
            "refer to the exact same object (same `id()`). Small ints (-5..256) and "
            "interned strings are cached, so `is` may *appear* to work for them — but "
            "relying on that is a bug. Use `is` only for singletons like `None`."
        ),
        "code_examples": [
            {"language": "python", "label": "Identity vs equality",
             "code": "a = [1, 2, 3]\nb = [1, 2, 3]\nprint(a == b)  # True (same values)\nprint(a is b)  # False (different objects)\n\nx = None\nprint(x is None)  # correct singleton check"},
        ],
        "tags": ["fundamentals", "identity"],
        "gotchas": ["`a is b` may pass for small ints due to caching — never rely on it."],
        "follow_ups": ["When is `is None` preferred over `== None`?", "What is string interning?"],
    },
    {
        "slug": "py-gil",
        "question": "What is the GIL and how does it affect concurrency?",
        "difficulty": "MEDIUM",
        "tldr": "The GIL lets only one thread execute Python bytecode at a time, so threads don't speed up CPU-bound work.",
        "explanation": (
            "CPython's Global Interpreter Lock serializes bytecode execution. Threads "
            "still help I/O-bound work (the GIL is released during blocking I/O), but "
            "for CPU-bound parallelism use `multiprocessing` or native extensions that "
            "release the GIL. Python 3.13+ ships an experimental free-threaded build."
        ),
        "code_examples": [
            {"language": "python", "label": "CPU-bound: use processes",
             "code": "from concurrent.futures import ProcessPoolExecutor\n\ndef work(n):\n    return sum(i * i for i in range(n))\n\nwith ProcessPoolExecutor() as ex:\n    results = list(ex.map(work, [1_000_000] * 4))"},
        ],
        "tags": ["concurrency", "internals"],
        "gotchas": ["Threads do NOT give CPU parallelism in CPython due to the GIL."],
        "follow_ups": ["When are threads still useful?", "What changed in free-threaded Python?"],
    },
]

QUESTIONS += [
    {
        "slug": "py-data-model-dunder",
        "question": "What is the Python data model and how do dunder (magic) methods work?",
        "difficulty": "MEDIUM",
        "tldr": "Dunder methods like __len__, __getitem__, and __repr__ let your objects hook into built-in syntax and functions by implementing a documented protocol.",
        "explanation": "Python's data model defines a set of special methods (named with double underscores) that the interpreter calls in response to syntax and built-ins; for example len(obj) calls obj.__len__() and obj[k] calls obj.__getitem__(k). By implementing these protocols a custom class integrates seamlessly with the language, supporting iteration, indexing, operator overloading, and more. This is duck typing at the syntax level: any object implementing the right dunders behaves like a built-in type.",
        "code_examples": [
            {"language": "python", "label": "Operator overloading via __add__",
             "code": "class Vector:\n    def __init__(self, x, y):\n        self.x, self.y = x, y\n    def __add__(self, other):\n        return Vector(self.x + other.x, self.y + other.y)\n    def __repr__(self):\n        return f\"Vector({self.x}, {self.y})\"\n\nprint(Vector(1, 2) + Vector(3, 4))  # Vector(4, 6)"},
        ],
        "tags": ["data-model", "dunder", "oop"],
        "gotchas": [
            "Defining __eq__ without __hash__ makes instances unhashable; you must set __hash__ explicitly if you still want to use them in sets/dicts.",
            "__repr__ is for developers/debugging while __str__ is for end users; missing __str__ falls back to __repr__.",
        ],
        "follow_ups": ["How does Python decide between __add__ and __radd__?", "What is the difference between __getattr__ and __getattribute__?"],
    },
    {
        "slug": "py-decorators",
        "question": "What is a decorator in Python and how would you write one that preserves the wrapped function's metadata?",
        "difficulty": "MEDIUM",
        "tldr": "A decorator is a callable that takes a function and returns a replacement function, and functools.wraps copies over the original's name, docstring, and metadata.",
        "explanation": "A decorator is syntactic sugar where @dec above a def is equivalent to func = dec(func); it lets you wrap behavior (logging, caching, timing) around a function without modifying its body. The wrapper typically uses *args/**kwargs to forward arguments transparently. Without functools.wraps the wrapper replaces the original's __name__ and __doc__, breaking introspection and tools that rely on it.",
        "code_examples": [
            {"language": "python", "label": "Decorator with functools.wraps",
             "code": "import functools\n\ndef timed(func):\n    @functools.wraps(func)\n    def wrapper(*args, **kwargs):\n        import time\n        start = time.perf_counter()\n        result = func(*args, **kwargs)\n        print(f\"{func.__name__} took {time.perf_counter() - start:.4f}s\")\n        return result\n    return wrapper\n\n@timed\ndef work():\n    return sum(range(1000))\n\nwork()"},
        ],
        "tags": ["decorators", "functions"],
        "gotchas": [
            "Forgetting functools.wraps loses the wrapped function's __name__/__doc__.",
            "A decorator that takes arguments needs an extra layer of nesting (a decorator factory).",
        ],
        "follow_ups": ["How would you write a decorator that accepts arguments?", "How do you stack multiple decorators and what order do they apply in?"],
    },
    {
        "slug": "py-generators-yield",
        "question": "What is a generator and how does yield differ from return?",
        "difficulty": "MEDIUM",
        "tldr": "A generator is a lazy iterator produced by a function using yield, which suspends and resumes execution while preserving local state instead of returning once.",
        "explanation": "A function containing yield becomes a generator function; calling it returns a generator object without running the body. Each next() call runs until the next yield, producing a value and freezing the frame (local variables, instruction pointer) until resumed. This enables lazy, memory-efficient pipelines over potentially infinite sequences, unlike return which exits and discards all state.",
        "code_examples": [
            {"language": "python", "label": "Infinite lazy generator",
             "code": "def fib():\n    a, b = 0, 1\n    while True:\n        yield a\n        a, b = b, a + b\n\ngen = fib()\nprint([next(gen) for _ in range(7)])  # [0, 1, 1, 2, 3, 5, 8]"},
        ],
        "tags": ["generators", "iterators"],
        "gotchas": [
            "Generators are single-pass; once exhausted they yield nothing and must be recreated.",
            "Returning a value inside a generator sets StopIteration.value rather than being yielded.",
        ],
        "follow_ups": ["What does generator.send() do?", "How does yield from delegate to a sub-generator?"],
    },
    {
        "slug": "py-context-managers",
        "question": "How do context managers work and how can you create one?",
        "difficulty": "MEDIUM",
        "tldr": "A context manager implements __enter__ and __exit__ (or uses @contextlib.contextmanager) so the with statement guarantees setup and teardown even on exceptions.",
        "explanation": "The with statement calls __enter__ on entry (binding its return to the as target) and __exit__ on exit, passing any exception type, value, and traceback. __exit__ returning a truthy value suppresses the exception. contextlib.contextmanager lets you write one as a generator where code before yield is setup and code after yield (typically in finally) is teardown.",
        "code_examples": [
            {"language": "python", "label": "contextmanager generator",
             "code": "from contextlib import contextmanager\n\n@contextmanager\ndef managed(resource):\n    print(f\"open {resource}\")\n    try:\n        yield resource\n    finally:\n        print(f\"close {resource}\")\n\nwith managed(\"db\") as r:\n    print(f\"using {r}\")"},
        ],
        "tags": ["context-manager", "with"],
        "gotchas": [
            "If teardown isn't in a finally block, an exception inside the with body can skip cleanup.",
            "Returning True from __exit__ silently swallows exceptions, which can hide bugs.",
        ],
        "follow_ups": ["How does contextlib.ExitStack help with a dynamic number of context managers?", "What is an async context manager (__aenter__/__aexit__)?"],
    },
    {
        "slug": "py-args-kwargs",
        "question": "What do *args and **kwargs mean, and how does argument unpacking work?",
        "difficulty": "EASY",
        "tldr": "*args collects extra positional arguments into a tuple and **kwargs collects extra keyword arguments into a dict, and the same star syntax unpacks iterables/mappings at call sites.",
        "explanation": "In a function signature *args gathers any surplus positional arguments into a tuple and **kwargs gathers surplus keyword arguments into a dict, enabling variadic functions and pass-through wrappers. At a call site the same * and ** operators unpack a sequence into positional arguments and a mapping into keyword arguments. Parameters after *args become keyword-only.",
        "code_examples": [
            {"language": "python", "label": "Collecting and unpacking arguments",
             "code": "def f(*args, **kwargs):\n    return args, kwargs\n\nprint(f(1, 2, x=3))  # ((1, 2), {'x': 3})\n\nnums = [1, 2, 3]\nopts = {\"x\": 9}\nprint(f(*nums, **opts))  # ((1, 2, 3), {'x': 9})"},
        ],
        "tags": ["args", "functions"],
        "gotchas": [
            "Passing a duplicate key via both an explicit kwarg and **kwargs raises TypeError.",
            "The names args/kwargs are convention only; the * and ** are what matter.",
        ],
        "follow_ups": ["How do you force keyword-only or positional-only parameters?", "What happens when you unpack a dict into *args instead of **kwargs?"],
    },
    {
        "slug": "py-comprehensions",
        "question": "What are comprehensions and what advantages do they have over loops?",
        "difficulty": "EASY",
        "tldr": "Comprehensions are concise expressions that build lists, sets, dicts, or generators in one pass, and are typically faster and more readable than equivalent for-loops with append.",
        "explanation": "List/set/dict comprehensions and generator expressions provide a declarative syntax to transform and filter iterables. They are usually faster than manual loops because the iteration is handled in optimized C and avoids repeated method lookups like list.append. In Python 3 they have their own scope, so the loop variable does not leak into the enclosing namespace.",
        "code_examples": [
            {"language": "python", "label": "List, set, dict, and generator forms",
             "code": "squares = [x * x for x in range(5)]\nevens = {x for x in range(10) if x % 2 == 0}\nlookup = {c: ord(c) for c in \"abc\"}\nlazy = (x * x for x in range(5))  # generator expression\nprint(squares, evens, lookup, next(lazy))"},
        ],
        "tags": ["comprehensions", "iterables"],
        "gotchas": [
            "Deeply nested or condition-heavy comprehensions hurt readability; prefer a loop then.",
            "A generator expression is lazy and single-use, unlike a list comprehension.",
        ],
        "follow_ups": ["Why don't comprehension loop variables leak in Python 3?", "When should you use a generator expression instead of a list comprehension?"],
    },
    {
        "slug": "py-asyncio-await",
        "question": "How does asyncio's async/await model achieve concurrency, and when is it appropriate?",
        "difficulty": "HARD",
        "tldr": "async/await provides single-threaded cooperative concurrency via an event loop that switches between coroutines at await points, ideal for I/O-bound (not CPU-bound) work.",
        "explanation": "Coroutines defined with async def run on an event loop and yield control at each await, letting the loop run other tasks while one waits on I/O. This is cooperative multitasking in a single thread, so it avoids thread-switching overhead and most locking, but a CPU-bound or blocking call stalls the entire loop. Use asyncio.gather or asyncio.create_task to run awaitables concurrently; CPU-bound work belongs in a process pool or run_in_executor.",
        "code_examples": [
            {"language": "python", "label": "Concurrent coroutines with gather",
             "code": "import asyncio\n\nasync def fetch(n):\n    await asyncio.sleep(0.1)\n    return n * 2\n\nasync def main():\n    results = await asyncio.gather(*(fetch(i) for i in range(3)))\n    print(results)  # [0, 2, 4]\n\nasyncio.run(main())"},
        ],
        "tags": ["asyncio", "concurrency"],
        "gotchas": [
            "Calling a blocking function (e.g. time.sleep, requests.get) inside a coroutine freezes the whole event loop.",
            "Forgetting to await a coroutine produces a 'coroutine was never awaited' warning and never runs it.",
        ],
        "follow_ups": ["What is the difference between asyncio.gather and asyncio.wait?", "How do you run blocking CPU-bound code without blocking the loop?"],
    },
    {
        "slug": "py-memory-gc",
        "question": "How does Python manage memory and garbage collection?",
        "difficulty": "HARD",
        "tldr": "CPython primarily uses reference counting to free objects immediately at zero refs, plus a generational cyclic garbage collector to reclaim reference cycles.",
        "explanation": "Every CPython object has a reference count; when it drops to zero the object is deallocated immediately. Because reference counting cannot reclaim cycles (objects referencing each other), CPython adds a generational garbage collector in the gc module that periodically detects and collects unreachable cycles, organizing objects into three generations for efficiency. Tools like weakref avoid keeping objects alive, and you can tune or disable the cyclic collector via the gc module.",
        "code_examples": [
            {"language": "python", "label": "Reference cycle reclaimed by gc.collect",
             "code": "import gc, sys\n\na = []\nb = [a]\na.append(b)  # reference cycle\nprint(sys.getrefcount(a))\ndel a, b\nprint(gc.collect())  # reclaims the cycle, returns count of collected objects"},
        ],
        "tags": ["memory", "garbage-collection"],
        "gotchas": [
            "Reference cycles aren't freed by refcounting alone; objects with __del__ in cycles were historically uncollectable (relaxed in 3.4+).",
            "sys.getrefcount reports one extra reference because the argument itself is counted.",
        ],
        "follow_ups": ["Why is the cyclic collector generational?", "When would you use weakref instead of a strong reference?"],
    },
    {
        "slug": "py-slots",
        "question": "What does __slots__ do and what are its trade-offs?",
        "difficulty": "MEDIUM",
        "tldr": "__slots__ replaces an instance's per-object __dict__ with a fixed set of descriptors, reducing memory and slightly speeding attribute access at the cost of flexibility.",
        "explanation": "By default each instance stores attributes in a per-instance __dict__, which is flexible but memory-heavy. Declaring __slots__ tells Python to allocate fixed storage for the named attributes and skip the __dict__, saving significant memory when you create many instances and making attribute access marginally faster. The trade-offs: you can't add undeclared attributes, no __dict__/__weakref__ unless explicitly listed, and subclasses re-introduce __dict__ unless they also define __slots__.",
        "code_examples": [
            {"language": "python", "label": "__slots__ blocks new attributes",
             "code": "class Point:\n    __slots__ = (\"x\", \"y\")\n    def __init__(self, x, y):\n        self.x, self.y = x, y\n\np = Point(1, 2)\ntry:\n    p.z = 3  # AttributeError: no __dict__\nexcept AttributeError as e:\n    print(\"cannot add z:\", e)"},
        ],
        "tags": ["slots", "memory"],
        "gotchas": [
            "A subclass without __slots__ regains a __dict__, negating the memory savings.",
            "Without listing __weakref__ in __slots__, instances can't be weakly referenced.",
        ],
        "follow_ups": ["How does __slots__ interact with inheritance?", "Can you use __slots__ together with dataclasses?"],
    },
    {
        "slug": "py-metaclasses",
        "question": "What is a metaclass and when would you use one?",
        "difficulty": "HARD",
        "tldr": "A metaclass is the class of a class (type by default); it controls class creation and lets you customize or validate classes at definition time.",
        "explanation": "Just as a class is a template for instances, a metaclass is a template for classes; type is the default metaclass and calling type(name, bases, namespace) builds a class object. By subclassing type and overriding __new__ or __init__ you can inject methods, enforce constraints, or register classes when they are defined. Metaclasses are powerful but rarely needed; class decorators or __init_subclass__ usually suffice and are simpler.",
        "code_examples": [
            {"language": "python", "label": "Custom metaclass injecting an attribute",
             "code": "class AutoRepr(type):\n    def __new__(mcs, name, bases, ns):\n        ns.setdefault(\"created_by\", \"AutoRepr\")\n        return super().__new__(mcs, name, bases, ns)\n\nclass Widget(metaclass=AutoRepr):\n    pass\n\nprint(Widget.created_by)  # AutoRepr"},
        ],
        "tags": ["metaclass", "oop"],
        "gotchas": [
            "Mixing classes with conflicting metaclasses raises a metaclass conflict TypeError.",
            "Reaching for a metaclass when __init_subclass__ or a decorator would do adds needless complexity.",
        ],
        "follow_ups": ["How does __init_subclass__ compare to a metaclass?", "What is the difference between metaclass __new__ and __init__?"],
    },
    {
        "slug": "py-mutable-default-args",
        "question": "Why is using a mutable object as a default argument dangerous?",
        "difficulty": "EASY",
        "tldr": "Default arguments are evaluated once at function-definition time, so a mutable default like [] is shared across all calls and accumulates state.",
        "explanation": "Python evaluates default argument values a single time when the def executes, not on each call, and binds the result to the function object. If that default is mutable (list, dict, set), every call that relies on the default mutates the same shared object, producing surprising carry-over between calls. The idiomatic fix is to default to None and create a fresh object inside the body.",
        "code_examples": [
            {"language": "python", "label": "Shared default vs the None idiom",
             "code": "def bad(x, acc=[]):\n    acc.append(x)\n    return acc\n\nprint(bad(1))  # [1]\nprint(bad(2))  # [1, 2]  <- shared!\n\ndef good(x, acc=None):\n    acc = [] if acc is None else acc\n    acc.append(x)\n    return acc"},
        ],
        "tags": ["arguments", "gotcha"],
        "gotchas": [
            "Assuming the default is re-created each call; it is created once at def time.",
            "Using {} or [] as a default and then mutating it across calls.",
        ],
        "follow_ups": ["How could you intentionally use this 'gotcha' as a cache?", "When is a mutable default actually safe?"],
    },
    {
        "slug": "py-mro-multiple-inheritance",
        "question": "How does Python resolve method lookup with multiple inheritance (MRO)?",
        "difficulty": "HARD",
        "tldr": "Python computes a linear Method Resolution Order using the C3 linearization algorithm, which super() follows to call methods consistently across the inheritance graph.",
        "explanation": "With multiple inheritance, Python builds a single ordered list of classes (the MRO) using C3 linearization, which preserves the order each class lists its bases and ensures a child precedes its parents. Attribute and method lookups walk this MRO, and super() delegates to the next class in the MRO rather than literally to a parent, enabling cooperative multiple inheritance (e.g. mixins). If a consistent linearization can't be formed, defining the class raises a TypeError.",
        "code_examples": [
            {"language": "python", "label": "Diamond inheritance and super() chain",
             "code": "class A:\n    def go(self): print(\"A\")\nclass B(A):\n    def go(self): print(\"B\"); super().go()\nclass C(A):\n    def go(self): print(\"C\"); super().go()\nclass D(B, C):\n    def go(self): print(\"D\"); super().go()\n\nD().go()\nprint([c.__name__ for c in D.__mro__])  # D B C A object"},
        ],
        "tags": ["mro", "inheritance"],
        "gotchas": [
            "Thinking super() calls the direct parent; it calls the next class in the MRO.",
            "Inconsistent base ordering can make C3 linearization impossible, raising TypeError.",
        ],
        "follow_ups": ["Why is super().__init__() needed in cooperative multiple inheritance?", "How does C3 linearization differ from depth-first lookup?"],
    },
    {
        "slug": "py-dataclasses",
        "question": "What are dataclasses and what do they generate for you?",
        "difficulty": "MEDIUM",
        "tldr": "The @dataclass decorator auto-generates __init__, __repr__, __eq__ (and optionally ordering/immutability) from class-level annotated fields.",
        "explanation": "dataclasses.dataclass reads the class's type-annotated attributes and synthesizes boilerplate methods like __init__, __repr__, and __eq__, reducing repetitive code for data-holding classes. Options like frozen=True make instances immutable and hashable, order=True adds comparison methods, and field() configures defaults, default_factory, and per-field behavior. Mutable defaults must use field(default_factory=...) to avoid the shared-default trap.",
        "code_examples": [
            {"language": "python", "label": "Frozen, ordered dataclass with default_factory",
             "code": "from dataclasses import dataclass, field\n\n@dataclass(frozen=True, order=True)\nclass Point:\n    x: int\n    y: int = 0\n    tags: list = field(default_factory=list)\n\nprint(Point(1, 2))\nprint(Point(1) < Point(2))  # True"},
        ],
        "tags": ["dataclasses", "oop"],
        "gotchas": [
            "Using a mutable default directly (tags: list = []) raises ValueError; use field(default_factory=list).",
            "frozen=True blocks attribute assignment, so __post_init__ must use object.__setattr__ to set derived fields.",
        ],
        "follow_ups": ["How does a dataclass with eq=True affect hashability?", "When would you choose a NamedTuple or pydantic model over a dataclass?"],
    },
    {
        "slug": "py-type-hints",
        "question": "What are type hints in Python and are they enforced at runtime?",
        "difficulty": "EASY",
        "tldr": "Type hints annotate expected types for readability and static analysis, but CPython does not enforce them at runtime; tools like mypy check them statically.",
        "explanation": "Type hints (PEP 484) let you annotate variables, parameters, and return values with expected types, improving readability and enabling static type checkers, IDE completion, and refactoring tools. They are not enforced by the interpreter at runtime; annotations are stored in __annotations__ and otherwise ignored unless a library inspects them. The typing module provides constructs like Optional, Union (or |), Generic, and Protocol for richer annotations.",
        "code_examples": [
            {"language": "python", "label": "Annotations stored, not enforced",
             "code": "from typing import Optional\n\ndef greet(name: str, times: int = 1) -> Optional[str]:\n    if times <= 0:\n        return None\n    return \" \".join([f\"Hi {name}\"] * times)\n\nprint(greet.__annotations__)\nprint(greet(\"Ada\", 2))"},
        ],
        "tags": ["typing", "type-hints"],
        "gotchas": [
            "Assuming a wrong-typed argument raises at runtime; it won't without explicit validation.",
            "Using mutable or forward-referenced types may need from __future__ import annotations or string literals.",
        ],
        "follow_ups": ["What is the difference between typing.Protocol and an abstract base class?", "How do runtime validators like pydantic use type hints?"],
    },
    {
        "slug": "py-exception-handling",
        "question": "Explain Python's exception handling, including else and finally clauses.",
        "difficulty": "EASY",
        "tldr": "try/except catches exceptions, else runs only if no exception occurred, and finally always runs for cleanup regardless of outcome.",
        "explanation": "A try block's except clauses catch matching exception types (checked top to bottom), and you should catch the most specific exceptions you can handle. The else clause runs only when the try body raised nothing, which keeps the protected code minimal, while finally always executes for cleanup even if an exception propagates or a return occurs. Use raise without arguments to re-raise the current exception and 'raise ... from ...' to chain causes.",
        "code_examples": [
            {"language": "python", "label": "except / else / finally with chaining",
             "code": "def parse(s):\n    try:\n        value = int(s)\n    except ValueError as e:\n        raise ValueError(f\"bad input: {s!r}\") from e\n    else:\n        return value\n    finally:\n        print(\"done\")\n\nprint(parse(\"42\"))"},
        ],
        "tags": ["exceptions", "error-handling"],
        "gotchas": [
            "A bare 'except:' also catches SystemExit and KeyboardInterrupt; catch Exception instead.",
            "A return/break in finally suppresses any in-flight exception, hiding errors.",
        ],
        "follow_ups": ["What is the difference between 'raise X' and 'raise X from Y'?", "What are exception groups and except* in Python 3.11+?"],
    },
    {
        "slug": "py-iterators-vs-iterables",
        "question": "What is the difference between an iterable and an iterator?",
        "difficulty": "MEDIUM",
        "tldr": "An iterable implements __iter__ to produce an iterator, while an iterator implements __next__ (and returns itself from __iter__) and is consumed as you advance it.",
        "explanation": "An iterable is any object you can get an iterator from via iter(), i.e. it defines __iter__; lists, strings, and dicts are iterables. An iterator is the stateful object returned by __iter__ that yields the next item on each next() call and raises StopIteration when exhausted; it must also return itself from __iter__. This distinction is why you can loop over a list many times (it produces a fresh iterator each time) but a generator/iterator only once.",
        "code_examples": [
            {"language": "python", "label": "An iterator implementing __iter__ and __next__",
             "code": "class Count:\n    def __init__(self, n): self.n = n\n    def __iter__(self): self.i = 0; return self\n    def __next__(self):\n        if self.i >= self.n: raise StopIteration\n        self.i += 1\n        return self.i\n\nprint(list(Count(3)))  # [1, 2, 3]"},
        ],
        "tags": ["iterators", "iterables"],
        "gotchas": [
            "Reusing an exhausted iterator yields nothing; re-call iter() on the iterable for a fresh pass.",
            "Forgetting __iter__ on an iterator breaks its use directly in for-loops.",
        ],
        "follow_ups": ["Why must an iterator's __iter__ return self?", "How do generators implement the iterator protocol automatically?"],
    },
    {
        "slug": "py-shallow-vs-deep-copy",
        "question": "What is the difference between a shallow copy and a deep copy?",
        "difficulty": "MEDIUM",
        "tldr": "A shallow copy duplicates the outer container but shares the nested objects, while a deep copy recursively duplicates everything so the copies are fully independent.",
        "explanation": "copy.copy (or slicing/list()) creates a new outer object whose elements are references to the same inner objects, so mutating a nested element shows up in both copies. copy.deepcopy recursively copies nested objects, producing a completely independent structure and correctly handling shared references and cycles via a memo dict. Deep copies are safer for nested mutable data but slower and more memory-intensive.",
        "code_examples": [
            {"language": "python", "label": "Shallow shares nested lists, deep does not",
             "code": "import copy\n\noriginal = [[1, 2], [3, 4]]\nshallow = copy.copy(original)\ndeep = copy.deepcopy(original)\n\noriginal[0].append(99)\nprint(shallow)  # [[1, 2, 99], [3, 4]]  shared inner list\nprint(deep)     # [[1, 2], [3, 4]]      independent"},
        ],
        "tags": ["copy", "mutability"],
        "gotchas": [
            "Assuming list(x) or x[:] deep-copies; it only copies one level.",
            "deepcopy can be slow and may call __deepcopy__/__reduce__ on custom objects unexpectedly.",
        ],
        "follow_ups": ["How does deepcopy handle reference cycles?", "How can a class customize its copy behavior?"],
    },
    {
        "slug": "py-list-vs-tuple",
        "question": "What are the differences between lists and tuples?",
        "difficulty": "EASY",
        "tldr": "Lists are mutable variable-length sequences, while tuples are immutable fixed sequences that can be hashable and are often used as records or dict keys.",
        "explanation": "Lists are mutable, so you can append, remove, and reassign elements, making them ideal for homogeneous, growing collections. Tuples are immutable; their fixed structure conveys 'this is a fixed record', allows them to be used as dict keys or set members (if their contents are hashable), and gives small memory/performance advantages. Immutability is shallow, though: a tuple containing a list can still have that list mutated.",
        "code_examples": [
            {"language": "python", "label": "Mutability and hashability difference",
             "code": "lst = [1, 2, 3]\nlst.append(4)  # fine\n\ntup = (1, 2, 3)\ntry:\n    tup[0] = 9  # TypeError\nexcept TypeError as e:\n    print(e)\n\nprint({(1, 2): \"point\"})  # tuple as a dict key"},
        ],
        "tags": ["list", "tuple"],
        "gotchas": [
            "A tuple is only hashable if all its elements are hashable; (1, [2]) is not.",
            "A single-element tuple needs a trailing comma: (1,), not (1).",
        ],
        "follow_ups": ["Why might a tuple use less memory than an equivalent list?", "When would you prefer a namedtuple over a plain tuple?"],
    },
    {
        "slug": "py-global-nonlocal",
        "question": "What is the difference between the global and nonlocal keywords?",
        "difficulty": "MEDIUM",
        "tldr": "global rebinds a name in the module-level namespace, while nonlocal rebinds a name in the nearest enclosing (non-global) function scope.",
        "explanation": "By default, assigning to a name inside a function creates a new local variable, shadowing any outer one. The global keyword declares that assignments target the module-level name instead, and nonlocal declares that they target the nearest enclosing function's variable (used in closures). nonlocal requires that the name already exist in an enclosing function scope; it cannot reach the global scope.",
        "code_examples": [
            {"language": "python", "label": "nonlocal closure vs global rebind",
             "code": "def make_counter():\n    count = 0\n    def inc():\n        nonlocal count\n        count += 1\n        return count\n    return inc\n\nc = make_counter()\nprint(c(), c(), c())  # 1 2 3\n\nx = 0\ndef set_global():\n    global x\n    x = 42\nset_global()\nprint(x)  # 42"},
        ],
        "tags": ["scope", "closures"],
        "gotchas": [
            "Reading then assigning a global without declaring 'global' raises UnboundLocalError.",
            "nonlocal can't bind to a module-level (global) variable; only enclosing function scopes.",
        ],
        "follow_ups": ["What is the LEGB scope resolution rule?", "Why does an augmented assignment like x += 1 trigger UnboundLocalError without a declaration?"],
    },
    {
        "slug": "py-fstrings-formatting",
        "question": "How do f-strings work and how do they compare to other string formatting methods?",
        "difficulty": "EASY",
        "tldr": "f-strings embed expressions inline with {expr} and format specs, evaluated at runtime, and are generally faster and more readable than %-formatting or str.format.",
        "explanation": "f-strings (PEP 498) are string literals prefixed with f where {expression} is evaluated at runtime and inserted, supporting format specifications after a colon (e.g. {value:.2f}) and conversion flags like !r. They are typically faster than %-formatting and str.format because the interpreter compiles them directly. Python 3.8+ adds the {expr=} self-documenting form, which prints both the expression text and its value.",
        "code_examples": [
            {"language": "python", "label": "Format specs, !r, and {x=}",
             "code": "name, pi = \"Ada\", 3.14159\nprint(f\"{name!r} likes {pi:.2f}\")  # 'Ada' likes 3.14\n\nx = 10\nprint(f\"{x=}\")  # x=10  (self-documenting, 3.8+)\n\nprint(f\"{1000000:,}\")  # 1,000,000"},
        ],
        "tags": ["f-strings", "formatting"],
        "gotchas": [
            "Before Python 3.12 you couldn't reuse the same quote type or backslashes inside f-string expressions.",
            "Never use f-strings to build SQL queries; use parameterized queries to avoid injection.",
        ],
        "follow_ups": ["What does the {expr=} self-documenting syntax do?", "When would you still prefer str.format or Template strings?"],
    },
]

