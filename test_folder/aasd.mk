ifneq ($(KERNELRELEASE),)

obj-m:=hello.o
else
KDIR :=/lib/modules/$(shell uname -r)/build
PWD  :=$(shell pwd)
all:
	make -C $(KDIR) M=$(PWD) modules
clean:
	@rm -f *.ko *.o *.mod.o *.symvers *.mod.c *.order .*.cmd .cache.mk
	@rm -r .tmp_versions
endif

$(subst <from>,<to>,<text>)
$(patsubst <pattern>,<replacement>,<text>)


PWD = 10