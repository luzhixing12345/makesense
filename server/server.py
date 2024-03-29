import asyncio
import json
import re
import time
import uuid
from json import JSONDecodeError
from typing import Optional

from lsprotocol.types import (TEXT_DOCUMENT_COMPLETION, TEXT_DOCUMENT_DID_CHANGE,
                               TEXT_DOCUMENT_DID_CLOSE, TEXT_DOCUMENT_DID_OPEN,
                               TEXT_DOCUMENT_SEMANTIC_TOKENS_FULL)
from lsprotocol.types import (CompletionItem, CompletionList, CompletionOptions,
                              CompletionParams, ConfigurationItem,
                              Diagnostic,
                              DidChangeTextDocumentParams,
                              DidCloseTextDocumentParams,
                              DidOpenTextDocumentParams, MessageType, Position,
                              Range, Registration, RegistrationParams,
                              SemanticTokens, SemanticTokensLegend, SemanticTokensParams,
                              Unregistration, UnregistrationParams,
                              WorkDoneProgressBegin, WorkDoneProgressEnd,
                              WorkDoneProgressReport,
                              WorkspaceConfigurationParams)
from pygls.server import LanguageServer

COUNT_DOWN_START_IN_SECONDS = 10
COUNT_DOWN_SLEEP_IN_SECONDS = 1


class MakefileLanguageServer(LanguageServer):
    CMD_COUNT_DOWN_BLOCKING = 'countDownBlocking'
    CMD_COUNT_DOWN_NON_BLOCKING = 'countDownNonBlocking'
    CMD_PROGRESS = 'progress'
    CMD_REGISTER_COMPLETIONS = 'registerCompletions'
    CMD_SHOW_CONFIGURATION_ASYNC = 'showConfigurationAsync'
    CMD_SHOW_CONFIGURATION_CALLBACK = 'showConfigurationCallback'
    CMD_SHOW_CONFIGURATION_THREAD = 'showConfigurationThread'
    CMD_UNREGISTER_COMPLETIONS = 'unregisterCompletions'

    CONFIGURATION_SECTION = 'makefileServer'

    def __init__(self, *args):
        super().__init__(*args)


makefile_server = MakefileLanguageServer('makesense-server', 'v0.1')


def _validate(ls: LanguageServer, params):
    ls.show_message_log('Validating json...')

    text_doc = ls.workspace.get_document(params.text_document.uri)

    source = text_doc.source
    diagnostics = _validate_json(source) if source else []

    ls.publish_diagnostics(text_doc.uri, diagnostics)


def _validate_json(source):
    """Validates json file."""
    diagnostics = []

    try:
        json.loads(source)
    except JSONDecodeError as err:
        msg = err.msg
        col = err.colno
        line = err.lineno

        d = Diagnostic(
            range=Range(
                start=Position(line=line - 1, character=col - 1),
                end=Position(line=line - 1, character=col)
            ),
            message=msg,
            source=type(makefile_server).__name__
        )

        diagnostics.append(d)

    return diagnostics


@makefile_server.feature(TEXT_DOCUMENT_COMPLETION, CompletionOptions(trigger_characters=[',']))
def completions(params: Optional[CompletionParams] = None) -> CompletionList:
    """Returns completion items."""
    # document = makefile_server.workspace.get_document(params.text_document.uri) : 文件的url
    # current_line = document.lines[params.position.line].strip() : 当前的修改位置
    return CompletionList(
        is_incomplete=False,
        items=[
            CompletionItem(label='"'),
            CompletionItem(label='['),
            CompletionItem(label=']'),
            CompletionItem(label='{'),
            CompletionItem(label='?'),
        ]
    )


@makefile_server.command(MakefileLanguageServer.CMD_COUNT_DOWN_BLOCKING)
def count_down_10_seconds_blocking(ls, *args):
    """Starts counting down and showing message synchronously.
    It will `block` the main thread, which can be tested by trying to show
    completion items.
    """
    for i in range(COUNT_DOWN_START_IN_SECONDS):
        ls.show_message(f'Counting down... {COUNT_DOWN_START_IN_SECONDS - i}')
        time.sleep(COUNT_DOWN_SLEEP_IN_SECONDS)


@makefile_server.command(MakefileLanguageServer.CMD_COUNT_DOWN_NON_BLOCKING)
async def count_down_10_seconds_non_blocking(ls, *args):
    """Starts counting down and showing message asynchronously.
    It won't `block` the main thread, which can be tested by trying to show
    completion items.
    """
    for i in range(COUNT_DOWN_START_IN_SECONDS):
        ls.show_message(f'Counting down... {COUNT_DOWN_START_IN_SECONDS - i}')
        await asyncio.sleep(COUNT_DOWN_SLEEP_IN_SECONDS)


# 当文件被修改的时候
@makefile_server.feature(TEXT_DOCUMENT_DID_CHANGE)
def did_change(ls:LanguageServer, params: DidChangeTextDocumentParams):
    """Text document did change notification."""
    _validate(ls, params)

# 当文件被关闭的时候
@makefile_server.feature(TEXT_DOCUMENT_DID_CLOSE)
def did_close(server: MakefileLanguageServer, params: DidCloseTextDocumentParams):
    """Text document did close notification."""
    server.show_message('Text Document Did Close???')


@makefile_server.feature(TEXT_DOCUMENT_DID_OPEN)
async def did_open(ls, params: DidOpenTextDocumentParams):
    """Text document did open notification."""
    ls.show_message('Text Document Did Open???hjkhjk')
    _validate(ls, params)


@makefile_server.feature(
    TEXT_DOCUMENT_SEMANTIC_TOKENS_FULL,
    SemanticTokensLegend(
        token_types = ["operator"],
        token_modifiers = []
    )
)
def semantic_tokens(ls: MakefileLanguageServer, params: SemanticTokensParams):
    """See https://microsoft.github.io/language-server-protocol/specification#textDocument_semanticTokens
    for details on how semantic tokens are encoded."""

    TOKENS = re.compile('".*"(?=:)')

    uri = params.text_document.uri
    doc = ls.workspace.get_document(uri)

    last_line = 0
    last_start = 0

    data = []

    for lineno, line in enumerate(doc.lines):
        last_start = 0

        for match in TOKENS.finditer(line):
            start, end = match.span()
            data += [
                (lineno - last_line),
                (start - last_start),
                (end - start),
                0,
                0
            ]

            last_line = lineno
            last_start = start

    return SemanticTokens(data=data)



@makefile_server.command(MakefileLanguageServer.CMD_PROGRESS)
async def progress(ls: MakefileLanguageServer, *args):
    """Create and start the progress on the client."""
    token = str(uuid.uuid4())
    # Create
    await ls.progress.create_async(token)
    # Begin
    ls.progress.begin(token, WorkDoneProgressBegin(title='Indexing', percentage=0))
    # Report
    for i in range(1, 10):
        ls.progress.report(
            token,
            WorkDoneProgressReport(message=f'{i * 10}%', percentage= i * 10),
        )
        await asyncio.sleep(2)
    # End
    ls.progress.end(token, WorkDoneProgressEnd(message='Finished'))


@makefile_server.command(MakefileLanguageServer.CMD_REGISTER_COMPLETIONS)
async def register_completions(ls: MakefileLanguageServer, *args):
    """Register completions method on the client."""
    params = RegistrationParams(registrations=[
                Registration(
                    id=str(uuid.uuid4()),
                    method=TEXT_DOCUMENT_COMPLETION,
                    register_options={"triggerCharacters": "[':']"})
             ])
    response = await ls.register_capability_async(params)
    if response is None:
        ls.show_message('Successfully registered completions method')
    else:
        ls.show_message('Error happened during completions registration.',
                        MessageType.Error)


@makefile_server.command(MakefileLanguageServer.CMD_SHOW_CONFIGURATION_ASYNC)
async def show_configuration_async(ls: MakefileLanguageServer, *args):
    """Gets exampleConfiguration from the client settings using coroutines."""
    try:
        config = await ls.get_configuration_async(
            WorkspaceConfigurationParams(items=[
                ConfigurationItem(
                    scope_uri='',
                    section=MakefileLanguageServer.CONFIGURATION_SECTION)
        ]))

        example_config = config[0].get('exampleConfiguration')

        ls.show_message(f'jsonServer.exampleConfiguration value: {example_config}')

    except Exception as e:
        ls.show_message_log(f'Error ocurred: {e}')


@makefile_server.command(MakefileLanguageServer.CMD_SHOW_CONFIGURATION_CALLBACK)
def show_configuration_callback(ls: MakefileLanguageServer, *args):
    """Gets exampleConfiguration from the client settings using callback."""
    def _config_callback(config):
        try:
            example_config = config[0].get('exampleConfiguration')

            ls.show_message(f'jsonServer.exampleConfiguration value: {example_config}')

        except Exception as e:
            ls.show_message_log(f'Error ocurred: {e}')

    ls.get_configuration(
        WorkspaceConfigurationParams(
            items=[
                ConfigurationItem(
                    scope_uri='',
                    section=MakefileLanguageServer.CONFIGURATION_SECTION)
            ]
        ),
        _config_callback
    )


@makefile_server.thread()
@makefile_server.command(MakefileLanguageServer.CMD_SHOW_CONFIGURATION_THREAD)
def show_configuration_thread(ls: MakefileLanguageServer, *args):
    """Gets exampleConfiguration from the client settings using thread pool."""
    try:
        config = ls.get_configuration(WorkspaceConfigurationParams(items=[
            ConfigurationItem(
                scope_uri='',
                section=MakefileLanguageServer.CONFIGURATION_SECTION)
        ])).result(2)

        example_config = config[0].get('exampleConfiguration')

        ls.show_message(f'jsonServer.exampleConfiguration value: {example_config}')

    except Exception as e:
        ls.show_message_log(f'Error ocurred: {e}')


@makefile_server.command(MakefileLanguageServer.CMD_UNREGISTER_COMPLETIONS)
async def unregister_completions(ls: MakefileLanguageServer, *args):
    """Unregister completions method on the client."""
    params = UnregistrationParams(unregisterations=[
        Unregistration(id=str(uuid.uuid4()), method=TEXT_DOCUMENT_COMPLETION)
    ])
    response = await ls.unregister_capability_async(params)
    if response is None:
        ls.show_message('Successfully unregistered completions method')
    else:
        ls.show_message('Error happened during completions unregistration.',
                        MessageType.Error)