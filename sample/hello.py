import sys

match sys.argv[1:]:
    case ["greet", name]:
        print(f"hello {name}")
    case _:
        print("usage: hello.py greet NAME")
