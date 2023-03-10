
# Makefile函数

在 Makefile 中可以使用函数来处理变量，从而让我们的命令或是规则更为的灵活和具有智能。make所支持的函数也不算很多，不过已经足够我们的操作了。函数调用后，函数的返回值可以当做变量来使用

这一节中单纯介绍一下makefile中函数的使用, 下一节中介绍一些常用且有用的自定义函数实现

## 函数调用语法

函数调用的基本模式如下

```Makefile
$(<function> <arguments>)
```

> 不建议使用{},统一使用()

**注意**, Makefile的所有变量都是字符串, 所以一定要注意空格的使用, 比如 `$(f 1,2)` 和 `$(f 1 , 2 )` 是不同的, 带入的参数是包含空格的, 所以向函数提供参数时，**最安全的做法是去除所有多余的空格**

## subst

```Makefile
$(subst <from>,<to>,<text>)
```

- 功能: 把字串 `text` 中的 `from` 字符串替换成 `to`
- 返回值: 被替换过后的字符串

```Makefile
a = feet on the street
b = $(subst ee,EE,$(a))

$(info $(b))
# fEEt on the strEEt
```

笔者注: subst的使用并不多, 因为毕竟是字符串全局匹配的替换, 虽然看起来 `$(subst .c,.o,$(a))` 就可以实现.c -> .o的替换,但是还是需要
考虑一些特殊情况, 比如 xxx.config , xxx.cc 这种文件名

如果确定没有问题使用倒也无妨, 不过建议使用下面的 patsubst

## patsubst

```Makefile
$(patsubst <pattern>,<replacement>,<text>)
```

- 功能: 查找 `text` 中的单词是否符合模式 `pattern` ，如果匹配的话，则以 `replacement` 替换
- 返回值: 被替换过后的字符串

```Makefile
a = x.c.c bar.c a.cc
b = $(patsubst %.c,%.o,$(a))
$(info $(b))

# x.c.o bar.o a.cc
```

笔者注: `$(patsubst %.c,%.o,$(a))` 这种方式是一种很常用的.c -> .o 的替换方法, 除此之外还可以直接使用变量替换

```Makefile
a = x.c.c bar.c a.cc
# b = $(patsubst %.c,%.o,$(a))
b = $(a:.c=.o)
$(info $(b))

# x.c.o bar.o a.cc
```

这两种方式完全等价

## strip

```Makefile
$(strip <string>)
```

- 功能: 去掉 `string` 字串中开头和结尾的空字符
- 返回值: 被去掉空格的字符串值

```Makefile
x = $(strip a b c )

$(info $(x))
# a b c
```

笔者注: strip函数用的不算多, 因为正如前文所述, makefile中字符串的空格是有含义的, 我们并不能确定是否需要保留/剔除空格, 但为了安全起见还是可以使用 strip 去实现功能的

## findstring

```Makefile
$(findstring <str>,<text>)
```

- 功能: 在字串 `text` 中查找 `str` 字串
- 返回值: 如果找到，那么返回 `str` ，否则返回空字符串

```Makefile
a = $(findstring a,a b c)
b = $(findstring a,b c)
$(info $(a))
$(info $(b))

# a
#  
```

笔者注: 查找一个字符串中是否存在另一个字符串是一种很常用的功能, 但是在makefile中确实有些鸡肋, 往往需要配合一些其他的条件分支判断来组合构造一些实用的函数再去使用

## filter filter-out

```Makefile
$(filter <pattern...>,<text>)
# filter-out 与 filter 功能相反
$(filter-out <pattern...>,<text>)
```

- 功能: 以 `pattern` 模式过滤 `text` 字符串中的单词，保留符合模式 `pattern` 的单词。pattern可以有多个模式
- 返回值: 符合模式 `pattern` 的字串

```Makefile
sources := foo.c bar.c baz.s ugh.h
foo: $(sources)
    cc $(filter %.c %.s,$(sources)) -o foo

# 这里过滤之后的结果是 foo.c bar.c baz.s

objects=main1.o foo.o main2.o bar.o
mains=main1.o main2.o

a = $(filter-out $(mains),$(objects))
# foo.o bar.o
```

笔者注: filter 函数算是很有用的了, 一个比较常用的使用方式是过滤掉 `.h` 文件, 因为.h不参与编译链接仅在预处理阶段被展开, 所以往往它并不被作为依赖文件添加到Makefile的规则中, 但是有的时候我们会修改.h中的一些值makefile没有追踪它的文件修改时间, 所以还是显示 `up to date`, 当然我们可以make clean清空然后重新编译, 也可以使用这种filter的方式追踪.h, 但是编译的时候过滤掉

## sort

```Makefile
$(sort <list>)
```

- 功能: 给字符串 `list` 中的单词排序（升序）
- 返回值: 排序后的字符串

```Makefile
x = $(sort foo bar lose axx Ac Bax)
$(info $(x))

# Ac Bax axx bar foo lose
```

笔者注: 基本用不到, 但是需要注意sort可以去掉list中重复出现的元素, 所以可以当作去重函数来用?

## word

```Makefile
$(word <n>,<text>)
```

- 功能: 取字符串 `text` 中第 `n` 个单词 (n从1开始)
- 返回值: `text` 中第 `n` 个单词, 如果n超过单词数则返回空

```Makefile
$(word 2, foo bar baz)
# bar
```

## wordlist

```Makefile
$(wordlist <start>,<end>,<text>)
```

- 功能: 从字符串 `text` 中取从 `start` 开始到 `end` 的单词串。`start` 和 `end` 是数字
- 返回值: 返回字符串 `text` 中从 `start` 到 `end` 的单词字串

  - start > len(text), 返回空
  - end > len(text), 返回到结尾的
  - end > start, 返回空

```Makefile
$(wordlist 2, 3, foo bar baz)
# bar baz
```

## words

```Makefile
$(words <text>)
```

- 功能: 统计 `text` 中字符串中的单词个数
- 返回值:  `text` 中的单词数

```Makefile
$(words, foo bar baz)
# 3
```

笔者注: word words wordlist可以配合使用一下, 比如要得到最后一个单词

```Makefile
$(word $(words <text>),<text>)
```

## firstword

```Makefile
$(firstword <text>)
```

- 功能: 取字符串 `text` 中的第一个单词
- 返回值: 返回 `text` 的第一个单词

```Makefile
$(firstword foo bar)
# foo
```

笔者注: 功能完全等价于 `$(word 1,<text>)`

## dir

```Makefile
$(dir <names...>)
```

- 功能: 从文件名序列 `names` 中取出目录部分。目录部分是指最后一个反斜杠（/ ）之前的部分。如果没有反斜杠，那么返回 ./
- 返回值: 文件名序列 `names` 的目录部分

```Makefile
$(dir src/foo.c hacks s/c)
# src/ ./ s/
```

## notdir

```Makefile
$(notdir <names...>)
```

- 功能: 从文件名序列 `names` 中取出非目录部分。非目录部分是指最後一个反斜杠（/ ）之后的部分
- 返回值: 文件名序列 `names` 的非目录部分

```Makefile
$(notdir src/foo.c hacks)
# foo.c hacks
```

笔者注: dir 和 notdir 算是很常用很实用的功能了, 可以比较有效的差分目录, 合并文件结构等等

## suffix

```Makefile
$(suffix <names...>)
```

- 功能: 从文件名序列 `names` 中取出各个文件名的后缀
- 返回值: 文件名序列 `names` 的后缀序列，**如果文件没有后缀，则返回空字串**

```Makefile
$(suffix src/foo.c src-1.0/bar.c hacks x.config.y)
# .c .c .y
```

笔者注: 这里的后缀就是最后一个.的后面的字符串, 所以如果是类似x.config.y这种情况也需要注意一下

## basename

```Makefile
$(basename <names...>)
```

- 功能: 从文件名序列 `names` 中取出各个文件名的前缀部分
- 返回值: 回文件名序列 `names` 的前缀序列，如果文件没有前缀，则返回空字串

```Makefile
$(basename src/foo.c src-1.0/bar.c hacks)
# src/foo src-1.0/bar hacks
```

## addsuffix

```Makefile
$(addsuffix <suffix>,<names...>)
```

- 功能: 把后缀 `suffix` 加到 `names` 中的每个单词后面
- 返回值: 加过后缀的文件名序列

```Makefile
$(addsuffix .c,foo bar)
# foo.c bar.c
```

## addprefix

```Makefile
$(addprefix <prefix>,<names...>)
```

- 功能: 把前缀 `prefix` 加到 `names` 中的每个单词前面
- 返回值: 加过前缀的文件名序列

```Makefile
$(addprefix src/,foo bar)
# src/foo src/bar
```

笔者注: 加后缀,删后缀,加前缀,删前缀这种比较常用的函数确实很多时候会遇到

## join

```Makefile
$(join <list1>,<list2>)
```

- 功能: 把 `list2` 中的单词对应地加到 `list1` 的单词后面
  - 如果list1比list2多, 则多出来的保持原样
  - 如果list2比list1多, 则多出来的被复制到list1中
- 返回值: 连接过后的字符串

```Makefile
$(join aaa bbb ccc ddd, 111 222 333)
# aaa111 bbb222 ccc333 ddd
$(join aaa bbb , 111 222 333)
# aaa111 bbb222 333
```

## foreach

```Makefile
$(foreach <var>,<list>,<text>)
```

- 功能: 把参数 `list` 中的单词逐一取出放到参数 `var` 所指定的变量中，然后再执行 `text` 所包含的表达式
- 返回值: 每一次 `text` 会返回一个字符串，循环过程中，`text` 的所返回的每个字符串会以空格分隔，最后当整个循环结束，`text` 所返回的每个字符串所组成的整个字符串

var 通常是一个变量名, list 可以是一个表达式，而 text 中一般会使用 var 这个参数来依次枚举 list 中的单词

```Makefile
names := a b c d
files := $(foreach n,$(names),$(n).o)

# $(name) 中的单词会被挨个取出，并存到变量 n 中，$(n).o 每次根据 $(n) 计算出
# 一个值，这些值以空格分隔，最后作为 foreach 函数的返回
# a.o b.o c.o d.o
```

笔者注: foreach 中的 `var` 参数是一个临时的局部变量，foreach 函数执行完后，参数 `var` 的变量将不在作用，其作用域只在 foreach 函数当中

## if

```Makefile
$(if <condition>,<then-part>)
$(if <condition>,<then-part>,<else-part>)
```

- 功能: `condition` 参数是 if 的表达式，如果其返回的为非空字符串，那么这个表达式就相当于返回真，于是，`then-part` 会被计算，否则 `else-part` 会被计算
- 返回值: 如果 `condition` 为真（非空字符串），那个 `then-part` 会是整个函数的返回值，如果 `condition` 为假（空字符串），那么 `else-part` 会是整个函数的返回值，此时如果 `else-part` 没有被定义，那么，整个函数返回空字串

```Makefile
# 判断变量FOO是否为空
x = $(if $(FOO),FOO is not empty,FOO is empty)
```

## call

```Makefile
$(call <expression>,<parm1>,<parm2>,...,<parmn>)
```

- 功能: 创建新的参数化的函数
- 返回值: 当 make 执行这个函数时，`expression` 参数中的变量，如 $(1) 、$(2) 等，会被参数 parm1, parm2 依次取代。而 `expression` 的返回值就是 call 函数的返回值

```Makefile
reverse = $(2) $(1)
foo = $(call reverse,a,b)

# b a
```

## origin

```Makefile
$(origin <variable>)
```

- 功能: 输出变量的来源
- 返回值: 变量的来源

  - undefined: 从来没有定义过
  - default: 是一个默认的定义，比如“CC”这个变量
  - environment: 一个环境变量, 并且当 Makefile 被执行时，-e 参数没有被打开
  - file: 量被定义在 Makefile 中
  - command line: 变量是被命令行定义的
  - override: 被 override 指示符重新定义的
  - automatic: 是一个命令运行中的自动化变量

笔者注: 这些信息对于我们编写 Makefile 是非常有用的，例如，假设我们有一个 Makefile 其包了一个定义文
件 Make.def，在 Make.def 中定义了一个变量“bletch”，而我们的环境中也有一个环境变量“bletch”，此
时，我们想判断一下，如果变量来源于环境，那么我们就把之重定义了，如果来源于 Make.def 或是命令
行等非环境的，那么我们就不重新定义它。于是，在我们的 Makefile 中，我们可以这样写

```Makefile
ifdef bletch
    ifeq "$(origin bletch)" "environment"
        bletch = barf, gag, etc.
    endif
endif
```

## shell

```Makefile
contents := $(shell cat foo)
files := $(shell echo *.c)
```

- 功能: 把执行操作系统命令后的输出作为函数返回
- 返回值: 执行操作系统命令后的输出

笔者注: 这个函数会新生成一个 Shell 程序来执行命令，所以你要注意其运行性能，如果你的 Makefile
中有一些比较复杂的规则，并大量使用了这个函数，那么对于你的系统性能是有害的。特别是 Makefile
的隐晦的规则可能会让你的 shell 函数执行的次数比你想像的多得多

## error warning

```Makefile
$(error <text ...>)
$(warning <text ...>)
```

- 功能: make 提供了一些函数来控制 make 的运行。通常，你需要检测一些运行 Makefile 时的运行时信息，并且根据这些信息来决定，你是让 make 继续执行，还是停止
  - error: 退出makefile
  - warining: 是输出一段警告信息，而 make 继续执行

```Makefile
# 会在变量 ERROR_001 定义了后执行时产生 error 调用

ifdef ERROR_001
    $(error error is $(ERROR_001))
endif

#目录 err 被执行时才发生 error 调用

ERR = $(error found an error!)
.PHONY: err
err: $(ERR)

``` 