<!-- sidebar shell-->

<div class="flex-col dailyTodo w-[290px] min-w-[290px] h-full relative mr-4">
    <div class="header h-8 my-2 flex justify-between bg-none">
        <slot name="navi"/>
    </div>
    <hr class="!border-dashed border-2 mb-2 " />
    <div class="w-full h-[clac(100%-80px)] overflow-y-auto">
        <slot name="content"/>
    </div>
</div>

<style>
    .dailyTodo{
        @apply rounded-r-2xl rounded-l-none border-double border-4 border-primary-400 dark:border-primary-700;
    }
</style>