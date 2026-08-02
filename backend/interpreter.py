import re
from lexer import Lexer
from parser import parser


class ReturnException(Exception):
    def __init__(self, value):
        self.value = value


class Interpreter:

    def __init__(self):
        self.scopes = [{}]
        self.functions = {}
        self.output = []

    @property
    def variables(self):
        combined = {}
        for scope in self.scopes:
            combined.update(scope)
        return combined

    def visit(self, node):
        method_name = f"visit_{type(node).__name__}"
        method = getattr(self, method_name)
        return method(node)

    def visit_NumberNode(self, node):
        return node.token.value

    def visit_BinOpNode(self, node):
        left = self.visit(node.left)
        right = self.visit(node.right)

        if node.op_token.type == "PLUS":
            return left + right
        elif node.op_token.type == "MINUS":
            return left - right
        elif node.op_token.type == "MULTIPLY":
            return left * right
        elif node.op_token.type == "DIVIDE":
            return left / right
        elif node.op_token.type == "GREATER":
            return left > right
        elif node.op_token.type == "LESS":
            return left < right
        elif node.op_token.type == "EQUAL_EQUAL":
            return left == right
        elif node.op_token.type == "NOT_EQUAL":
            return left != right
        elif node.op_token.type == "GREATER_EQUAL":
            return left >= right
        elif node.op_token.type == "LESS_EQUAL":
            return left <= right

    def visit_PrintNode(self, node):
        value = self.visit(node.value)
        self.output.append(str(value))

    def visit_StringNode(self, node):
        text = node.token.value
        matches = re.findall(r'\{(.*?)\}', text)
        for expr in matches:
            lexer = Lexer(expr)
            tokens = lexer.tokenize()
            p = parser(tokens)
            expr_ast = p.comparison()
            result = self.visit(expr_ast)
            text = text.replace(f"{{{expr}}}", str(result))
        return text

    def visit_AssignNode(self, node):
        name = node.name.value if hasattr(node.name, 'value') else node.name
        value = self.visit(node.value)
        self.scopes[-1][name] = value
        return value

    def visit_IdentifierNode(self, node):
        name = node.token.value if hasattr(node.token, 'value') else node.token
        for scope in reversed(self.scopes):
            if name in scope:
                return scope[name]
        raise Exception(f"Undefined variable: {name}")

    def visit_ProgramNode(self, node):
        result = None
        for statement in node.statements:
            result = self.visit(statement)
        return result

    def get_output(self):
        return "\n".join(self.output)

    def visit_IfNode(self, node):
        condition = self.visit(node.condition)
        if condition:
            for stmt in node.body:
                self.visit(stmt)
        elif node.else_body:
            for stmt in node.else_body:
                self.visit(stmt)

    def visit_WhileNode(self, node):
        while self.visit(node.condition):
            for stmt in node.body:
                self.visit(stmt)

    def visit_FunctionNode(self, node):
        name = node.name.value if hasattr(node.name, 'value') else node.name
        self.functions[name] = node
        return None

    def visit_CallNode(self, node):
        name = node.name.value if hasattr(node.name, 'value') else node.name
        if name not in self.functions:
            raise Exception(f"Undefined function: {name}")

        func_node = self.functions[name]
        arg_values = [self.visit(arg) for arg in node.args]

        if len(arg_values) != len(func_node.params):
            raise Exception(f"Function '{name}' expects {len(func_node.params)} arguments, got {len(arg_values)}")

        local_scope = {}
        for param, val in zip(func_node.params, arg_values):
            param_name = param.value if hasattr(param, 'value') else param
            local_scope[param_name] = val

        self.scopes.append(local_scope)

        return_val = None
        try:
            for stmt in func_node.body:
                self.visit(stmt)
        except ReturnException as e:
            return_val = e.value
        finally:
            self.scopes.pop()

        return return_val

    def visit_ReturnNode(self, node):
        value = self.visit(node.value) if node.value is not None else None
        raise ReturnException(value)