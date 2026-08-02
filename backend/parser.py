
from  token1 import *
from node import *

class parser :

    def __init__(self, tokens):
      self.tokens =tokens
      self.pos= 0

    @property
    def current_token(self):

      if self.pos >= len(self.tokens):
        return None

      return self.tokens[self.pos]
    
    def advance(self):
       self.pos += 1

    def factor(self):

     token = self.current_token

     if token.type == NUMBER:

        self.advance()
        return NumberNode(token)

     elif token.type == STRING:

        self.advance()
        return StringNode(token)

     elif token.type == IDENTIFIER:

        self.advance()
        if self.current_token and self.current_token.type == LPAREN:
            return self.function_call(token)
        return IdentifierNode(token)

     elif token.type == LPAREN:
        self.advance()
        node = self.comparison()
        if self.current_token and self.current_token.type == RPAREN:
            self.advance()
        return node

     raise Exception(f"Unexpected token: {token}")

    def term(self):

     left = self.factor()

     while self.current_token and self.current_token.type in (MULTIPLY, DIVIDE):

        op_token = self.current_token
        self.advance()

        right = self.factor()

        left = BinOpNode(left, op_token, right)

     return left

    def expr(self):

     left = self.term()

     while self.current_token and self.current_token.type in (PLUS, MINUS):

        op_token = self.current_token
        self.advance()

        right = self.term()

        left = BinOpNode(left, op_token, right)

     return left

    def comparison(self):

     left = self.expr()

     while self.current_token and self.current_token.type in (
        GREATER,
        LESS,
        EQUAL_EQUAL,
        NOT_EQUAL,
        GREATER_EQUAL,
        LESS_EQUAL
    ):

        op_token = self.current_token
        self.advance()

        right = self.expr()

        left = BinOpNode(left, op_token, right)

     return left

    def assignment(self):

      name = self.current_token
      self.advance()

      self.advance()
 
      value = self.comparison()

      return AssignNode(name, value)

    def print_statement(self):

     self.advance()

     value = self.comparison()

     return PrintNode(value)

    def statement(self):
        if self.current_token is None:
            return None

        if self.current_token.type == FUNC:
            return self.function_declaration()

        elif self.current_token.type == RETURN:
            return self.return_statement()

        elif self.current_token.type == WHILE:
            return self.while_statement()

        elif self.current_token.type == IF:
            return self.if_statement()

        elif self.current_token.type == PRINT:
            return self.print_statement()

        elif self.current_token.type == IDENTIFIER:
            if self.pos + 1 < len(self.tokens) and self.tokens[self.pos + 1].type == LPAREN:
                token = self.current_token
                self.advance()
                return self.function_call(token)
            else:
                return self.assignment()

        return None

    def parse(self):

     statements = []

     while self.current_token and self.current_token.type != EOF:
        stmt = self.statement()
        if stmt:
            statements.append(stmt)
        else:
            self.advance()

     return ProgramNode(statements)

    def if_statement(self):

     self.advance()  # skip IF

     condition = self.comparison()

     if self.current_token and self.current_token.type == LBRACE:
        self.advance()

     body = []

     while self.current_token and self.current_token.type != RBRACE and self.current_token.type != EOF:
        stmt = self.statement()
        if stmt:
            body.append(stmt)
        else:
            self.advance()

     if self.current_token and self.current_token.type == RBRACE:
        self.advance()  # skip }

     else_body = []

     if self.current_token and self.current_token.type == ELSE:

        self.advance()  # skip else

        if self.current_token and self.current_token.type == LBRACE:
            self.advance()

        while self.current_token and self.current_token.type != RBRACE and self.current_token.type != EOF:
            stmt = self.statement()
            if stmt:
                else_body.append(stmt)
            else:
                self.advance()

        if self.current_token and self.current_token.type == RBRACE:
            self.advance()  # skip }

     return IfNode(condition, body, else_body)

    def while_statement(self):

     self.advance()

     condition = self.comparison()

     if self.current_token and self.current_token.type == LBRACE:
        self.advance()

     body = []

     while self.current_token and self.current_token.type != RBRACE and self.current_token.type != EOF:
        stmt = self.statement()
        if stmt:
            body.append(stmt)
        else:
            self.advance()

     if self.current_token and self.current_token.type == RBRACE:
        self.advance()

     return WhileNode(condition, body)

    def function_declaration(self):

     self.advance()  # skip FUNC

     if not self.current_token or self.current_token.type != IDENTIFIER:
        raise Exception("Expected function name after 'func'")

     name_token = self.current_token
     self.advance()

     if not self.current_token or self.current_token.type != LPAREN:
        raise Exception(f"Expected '(' after function name '{name_token.value}'")

     self.advance()  # skip (

     params = []

     while self.current_token and self.current_token.type != RPAREN and self.current_token.type != EOF:
        if self.current_token.type == IDENTIFIER:
            params.append(self.current_token)
            self.advance()
        if self.current_token and self.current_token.type == COMMA:
            self.advance()

     if self.current_token and self.current_token.type == RPAREN:
        self.advance()  # skip )

     if self.current_token and self.current_token.type == LBRACE:
        self.advance()  # skip {

     body = []

     while self.current_token and self.current_token.type != RBRACE and self.current_token.type != EOF:
        stmt = self.statement()
        if stmt:
            body.append(stmt)
        else:
            self.advance()

     if self.current_token and self.current_token.type == RBRACE:
        self.advance()  # skip }

     return FunctionNode(name_token, params, body)

    def function_call(self, name_token):

     if self.current_token and self.current_token.type == LPAREN:
        self.advance()  # skip (

     args = []

     while self.current_token and self.current_token.type != RPAREN and self.current_token.type != EOF:
        args.append(self.comparison())
        if self.current_token and self.current_token.type == COMMA:
            self.advance()

     if self.current_token and self.current_token.type == RPAREN:
        self.advance()  # skip )

     return CallNode(name_token, args)

    def return_statement(self):

     self.advance()  # skip RETURN

     if self.current_token and self.current_token.type not in (RBRACE, EOF):
        val = self.comparison()
     else:
        val = None

     return ReturnNode(val)










    