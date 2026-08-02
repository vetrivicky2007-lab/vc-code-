class NumberNode:
    def __init__(self, token):
        self.token = token

    def __repr__(self):
        return f"{self.token}"
    
    def __str__(self):
         return self.__repr__()
    

class BinOpNode:
    def __init__(self, left, op_token, right):
        self.left = left
        self.op_token = op_token
        self.right = right

    def __repr__(self):
        return f"({self.left} {self.op_token} {self.right})"
    
    def __str__(self):
         return self.__repr__()
    


class AssignNode:
    def __init__(self, name, value):
        self.name = name
        self.value = value

    def __repr__(self):
        return f"({self.name} = {self.value})"
    
    def __str__(self):
         return self.__repr__()
    


class PrintNode:
    def __init__(self, value):
        self.value = value

    def __repr__(self):
        return f"(PRINT {self.value})"
    
    def __str__(self):
         return self.__repr__()
    

class StringNode:
    def __init__(self, token):
        self.token = token

    def __repr__(self):
        return f"{self.token}"
    





class IdentifierNode:
    def __init__(self, token):
        self.token = token

    def __repr__(self):
        return f"{self.token}"
    


class ProgramNode:
    def __init__(self, statements):
        self.statements = statements

    def __repr__(self):
        return f"{self.statements}"
    





class IfNode:

    def __init__(self, condition, body, else_body=None):
        self.condition = condition
        self.body = body
        self.else_body = else_body

    def __repr__(self):
        return f"If({self.condition})"
    



class WhileNode:

    def __init__(self, condition, body):
        self.condition = condition
        self.body = body

    def __repr__(self):
      return f"While({self.condition}, {self.body})"


class FunctionNode:

    def __init__(self, name, params, body):
        self.name = name
        self.params = params
        self.body = body

    def __repr__(self):
        return f"Function({self.name}, {self.params}, {self.body})"

    def __str__(self):
        return self.__repr__()


class CallNode:

    def __init__(self, name, args):
        self.name = name
        self.args = args

    def __repr__(self):
        return f"Call({self.name}, {self.args})"

    def __str__(self):
        return self.__repr__()


class ReturnNode:

    def __init__(self, value):
        self.value = value

    def __repr__(self):
        return f"Return({self.value})"

    def __str__(self):
        return self.__repr__()