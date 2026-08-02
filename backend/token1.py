NUMBER = "NUMBER"
STRING = "STRING"
IDENTIFIER = "IDENTIFIER"
IF = "IF"
MULTIPLY = "MULTIPLY"
DIVIDE = "DIVIDE"
ELSE = "ELSE"
PLUS = "PLUS"
MINUS = "MINUS"
WHILE = "WHILE"
EQUALS = "EQUALS"

PRINT = "PRINT"

LBRACE = "LBRACE"
RBRACE = "RBRACE"


GREATER = "GREATER"
LESS = "LESS"
EQUAL_EQUAL = "EQUAL_EQUAL"
NOT_EQUAL = "NOT_EQUAL"
GREATER_EQUAL = "GREATER_EQUAL"
LESS_EQUAL = "LESS_EQUAL"

FUNC = "FUNC"
RETURN = "RETURN"
LPAREN = "LPAREN"
RPAREN = "RPAREN"
COMMA = "COMMA"

EOF = "EOF"


class Token:
    def __init__(self, type_, value):
        self.type = type_
        self.value = value

    def __str__(self):
        return f"{self.type}:{self.value}"
    
    def __repr__(self):
        return self.__str__()