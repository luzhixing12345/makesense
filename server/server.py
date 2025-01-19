from pygls.server import LanguageServer
from lsprotocol import types

server = LanguageServer("example-server", "v0.1")


@server.feature(types.TEXT_DOCUMENT_COMPLETION)
def completions(params: types.CompletionParams):
    items = []
    document = server.workspace.get_text_document(params.text_document.uri)
    current_line = document.lines[params.position.line].strip()

    items = [
        types.CompletionItem(label="hello"),
        types.CompletionItem(label="friend"),
        types.CompletionItem(label="word"),
    ]
    return types.CompletionList(is_incomplete=False, items=items)


server.start_io()
