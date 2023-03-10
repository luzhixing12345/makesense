
# Makefile函数

在 Makefile 中可以使用函数来处理变量，从而让我们的命令或是规则更为的灵活和具有智能。make所支持的函数也不算很多，不过已经足够我们的操作了。函数调用后，函数的返回值可以当做变量来使用

这一节中单纯介绍一下makefile中函数的使用, 下一节中介绍一些常用且有用的自定义函数实现

## 函数调用语法

函数调用的基本模式如下

```Makefile
$(<function> <arguments>)
```

> 不建议使用{},统一使用()

**注意**, Makefile的所有变量都是字符串, 所以一定要注意空格的使用, 比如 `$(f 1,2)` 和 `$(f 1 , 2 )` 是不同的, 带入的参数是包含空格的

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

