from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

from lexer import Lexer
from parser import parser
from interpreter import Interpreter

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


class Code(BaseModel):
    code: str


@app.get("/")
def home():
    return {
        "message": "VC Backend Working"
    }


@app.post("/run")
def run(code_data: Code):

    try:

        code = code_data.code

        lexer = Lexer(code)
        tokens = lexer.tokenize()

        print("TOKENS:")
        for token in tokens:
            print(token)

        parser1 = parser(tokens)
        tree = parser1.parse()

        print("TREE:")
        print(tree)

        interpreter = Interpreter()

        interpreter.visit(tree)

        return {
            "output": interpreter.get_output()
        }

    except Exception as e:

        return {
            "output": f"VC Error: {str(e)}"
        }
        
    









#python -m uvicorn main:app --reload