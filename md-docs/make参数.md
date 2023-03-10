
# make参数

- -n, --just-print, --dry-run, --recon

  不执行参数，这些参数只是打印命令，不管目标是否更新，把规则和连带规则下的命令打印出来，
  但不执行，这些参数对于我们调试 makefile 很有用处

- -t, --touch

  把目标文件的时间更新，但不更改目标文件。也就是说，make 假装编译目标，但不是真正的编译目标，只是把目标变成已编译过的状态

- -q, --question

  这个参数的行为是找目标的意思，也就是说，如果目标存在，那么其什么也不会输出，当然也不会执行编译，如果目标不存在，其会打印出一条出错信息

- -W <file>, --what-if=<file>, --assume-new=<file>, --new-file=<file>

  这个参数需要指定一个文件。一般是是源文件（或依赖文件），Make 会根据规则推导来运行依赖于
  这个文件的命令，一般来说，可以和“-n”参数一同使用，来查看这个依赖文件所发生的规则命令。
  另外一个很有意思的用法是结合 -p 和 -v 来输出 makefile 被执行时的信息

- -b, -m

  这两个参数的作用是忽略和其它版本 make 的兼容性

- -B, --always-make

  认为所有的目标都需要更新（重编译）

- -C <dir>, --directory=<dir>

  指定读取 makefile 的目录。如果有多个“-C”参数，make 的解释是后面的路径以前面的作为相对
  路径，并以最后的目录作为被指定目录。如：“make -C ~hchen/test -C prog”等价于“make -C ~hchen/test/prog”

- -debug[=<options>]

  输出 make 的调试信息。它有几种不同的级别可供选择，如果没有参数，那就是输出最简单的调试
  信息。下面是 <options> 的取值

  - a: 也就是 all，输出所有的调试信息。（会非常的多）
  - b: 也就是 basic，只输出简单的调试信息。即输出不需要重编译的目标。
  - v: 也就是 verbose，在 b 选项的级别之上。输出的信息包括哪个 makefile 被解析，不需要被重编译的依赖文件（或是依赖目标）等。
  - i: 也就是 implicit，输出所有的隐含规则。
  - j: 也就是 jobs，输出执行规则中命令的详细信息，如命令的 PID、返回码等。
  - m: 也就是 makefile，输出 make 读取 makefile，更新 makefile，执行 makefile 的信息。

- -d

  相当于“–debug=a”

- -e, --environment-overrides

  指明环境变量的值覆盖 makefile 中定义的变量的值

- -f=<file>, --file=<file>, --makefile=<file>

  指定需要执行的 makefile

- -h, --help

  显示帮助信息。

- -i , --ignore-errors

  在执行时忽略所有的错误

- -I <dir>, --include-dir=<dir>

  指定一个被包含 makefile 的搜索目标。可以使用多个“-I”参数来指定多个目录

- -j [<jobsnum>], --jobs[=<jobsnum>]

  指同时运行命令的个数。如果没有这个参数，make 运行命令时能运行多少就运行多少。如果有一
  个以上的“-j”参数，那么仅最后一个“-j”才是有效的。（注意这个参数在 MS-DOS 中是无用的）

- -k, --keep-going

  出错也不停止运行。如果生成一个目标失败了，那么依赖于其上的目标就不会被执行了

- -l <load>, --load-average[=<load>], -max-load[=<load>]

  指定 make 运行命令的负载

- -o <file>, --old-file=<file>, --assume-old=<file>

  不重新生成的指定的 <file>，即使这个目标的依赖文件新于它

- -p, --print-data-base

  输出 makefile 中的所有数据，包括所有的规则和变量。这个参数会让一个简单的 makefile 都会输
  出一堆信息。如果你只是想输出信息而不想执行 makefile，你可以使用“make -qp”命令。如果你
  想查看执行 makefile 前的预设变量和规则，你可以使用 `make –p –f /dev/null`。这个参数输出的
  信息会包含着你的 makefile 文件的文件名和行号，所以，用这个参数来调试你的 makefile 会是很
  有用的，特别是当你的环境变量很复杂的时候

- -r, --no-builtin-rules

  禁止 make 使用任何隐含规则

- -R, --no-builtin-variabes

  禁止 make 使用任何作用于变量上的隐含规则

- -s, --silent, --quiet

  在命令运行时不输出命令的输出。

- -S, --no-keep-going, --stop

  取消“-k”选项的作用。因为有些时候，make 的选项是从环境变量“MAKEFLAGS”中继承下来
  的。所以你可以在命令行中使用这个参数来让环境变量中的“-k”选项失效

- -v, --version
  输出 make 程序的版本、版权等关于 make 的信息

- --warn-undefined-variables

  只要 make 发现有未定义的变量，那么就输出警告信息