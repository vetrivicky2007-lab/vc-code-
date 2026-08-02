from token1 import *


class Lexer :


    def __init__(self,text):
        self.pos=0
        self.text=text
    
    @property

    def current_char(self):

      if self.pos >= len(self.text):
        return None

      return self.text[self.pos]

    def advance(self):
       self.pos += 1

    def skip_whitespace(self):

     while self.current_char is not None and self.current_char.isspace():
        self.advance()


    def number(self):

     result = ""

     while self.current_char is not None and self.current_char.isdigit():
        result += self.current_char
        self.advance()

     return Token(NUMBER, int(result))
    
    def identifier(self):

     result = ""

     while self.current_char is not None and (
        self.current_char.isalnum() or self.current_char == "_"
    ):
        result += self.current_char
        self.advance()

     if result == "if":
        return Token(IF, result)

     if result == "else":
        return Token(ELSE, result)

     if result == "while":
        return Token(WHILE, result)

     if result == "func":
        return Token(FUNC, result)

     if result == "return":
        return Token(RETURN, result)

     return Token(IDENTIFIER, result)

     
                   



    def string(self):

     result = ""

     self.advance()

     while self.current_char is not None and self.current_char != '"':
        result += self.current_char
        self.advance()

     self.advance()

     return Token(STRING, result)
    
    
    def tokenize(self):

      tokens = []

      while self.current_char is not None:

        if self.current_char.isspace():
            self.skip_whitespace()

        elif self.current_char.isdigit():
            tokens.append(self.number())

        elif self.current_char.isalpha():
            tokens.append(self.identifier())

        elif self.current_char == '"':
            tokens.append(self.string())

        elif self.current_char == '+':
            tokens.append(Token(PLUS, '+'))
            self.advance()

        elif self.current_char == '>':

         self.advance()

         if self.current_char == '=':
          self.advance()
          tokens.append(Token(GREATER_EQUAL, ">="))
         else:
           tokens.append(Token(GREATER, ">"))
            
        elif self.current_char == '>':

          self.advance()

          if self.current_char == '=':

           self.advance()
           tokens.append(Token(GREATER_EQUAL, ">="))

          else:
           
           tokens.append(Token(GREATER, ">"))


        elif self.current_char == '<':

         self.advance()

         if self.current_char == '=':

          self.advance()
          tokens.append(Token(LESS_EQUAL, "<="))

         else:

          tokens.append(Token(LESS, "<"))

        elif self.current_char == '-':
            tokens.append(Token(MINUS, '-'))
            self.advance()

        elif self.current_char == '=':

         self.advance()

         if self.current_char == '=':

          self.advance()
          tokens.append(Token(EQUAL_EQUAL, "=="))

         else:

          tokens.append(Token(EQUALS, "="))

        elif self.current_char == '@':
            tokens.append(Token(PRINT, '@'))
            self.advance()

        elif self.current_char == '{':
            tokens.append(Token(LBRACE, '{'))
            self.advance()

        elif self.current_char == '}':
            tokens.append(Token(RBRACE, '}'))
            self.advance()

        elif self.current_char == '(':
            tokens.append(Token(LPAREN, '('))
            self.advance()

        elif self.current_char == ')':
            tokens.append(Token(RPAREN, ')'))
            self.advance()

        elif self.current_char == ',':
            tokens.append(Token(COMMA, ','))
            self.advance()


        elif self.current_char == '*':
            tokens.append(Token(MULTIPLY, '*'))
            self.advance()

        elif self.current_char == '/':
         tokens.append(Token(DIVIDE, '/'))
         self.advance()

        else:
            self.advance()

      tokens.append(Token(EOF, None))

      return tokens