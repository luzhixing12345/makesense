
x = $(wordlist 3, 4, foo bar baz) 
$(info $(x))

clean:
	