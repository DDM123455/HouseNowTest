import type { SVGProps } from 'react'

import { useEffect, useState } from 'react'
import { useAutoAnimate } from '@formkit/auto-animate/react'
import * as Checkbox from '@radix-ui/react-checkbox'
import * as Tabs from '@radix-ui/react-tabs'

import { api } from '@/utils/client/api'

/**
 * QUESTION 3:
 * -----------
 * A todo has 2 statuses: "pending" and "completed"
 *  - "pending" state is represented by an unchecked checkbox
 *  - "completed" state is represented by a checked checkbox, darker background,
 *    and a line-through text
 *
 * We have 2 backend apis:
 *  - (1) `api.todo.getAll`       -> a query to get all todos
 *  - (2) `api.todoStatus.update` -> a mutation to update a todo's status
 *
 * Example usage for (1) is right below inside the TodoList component. For (2),
 * you can find similar usage (`api.todo.create`) in src/client/components/CreateTodoForm.tsx
 *
 * If you use VSCode as your editor , you should have intellisense for the apis'
 * input. If not, you can find their signatures in:
 *  - (1) src/server/api/routers/todo-router.ts
 *  - (2) src/server/api/routers/todo-status-router.ts
 *
 * Your tasks are:
 *  - Use TRPC to connect the todos' statuses to the backend apis
 *  - Style each todo item to reflect its status base on the design on Figma
 *
 * Documentation references:
 *  - https://trpc.io/docs/client/react/useQuery
 *  - https://trpc.io/docs/client/react/useMutation
 *
 *
 *
 *
 *
 * QUESTION 4:
 * -----------
 * Implement UI to delete a todo. The UI should look like the design on Figma
 *
 * The backend api to delete a todo is `api.todo.delete`. You can find the api
 * signature in src/server/api/routers/todo-router.ts
 *
 * NOTES:
 *  - Use the XMarkIcon component below for the delete icon button. Note that
 *  the icon button should be accessible
 *  - deleted todo should be removed from the UI without page refresh
 *
 * Documentation references:
 *  - https://www.sarasoueidan.com/blog/accessible-icon-buttons
 *
 *
 *
 *
 *
 * QUESTION 5:
 * -----------
 * Animate your todo list using @formkit/auto-animate package
 *
 * Documentation references:
 *  - https://auto-animate.formkit.com
 */

export const TodoList = () => {
  const [tab, setTab] = useState<'All' | 'Pending' | 'Completed'>('All')
  type TabType = 'All' | 'Pending' | 'Completed'

  const arrState: TabType[] = ['All', 'Pending', 'Completed']
  const [todolist, setTodoList] =
    useState<{ status: 'completed' | 'pending'; id: number; body: string }[]>()
  const [parent] = useAutoAnimate()

  const { data: todos = [] } = api.todo.getAll.useQuery({
    statuses: ['completed', 'pending', 'completed'],
  })
  const apiContext = api.useContext()
  const { mutate: updateStatusTodo } = api.todoStatus.update.useMutation({
    onSuccess: () => {
      apiContext.todo.getAll.refetch()
    },
  })

  const { mutate: deleteTodo } = api.todo.delete.useMutation({})

  useEffect(() => {
    setTodoList(todos)
  }, [todos, tab])

  return (
    <ul className="grid grid-cols-1 gap-y-3">
      <div className="mb-10 mt-2 cursor-pointer">
        {/* {arrState.map((item: any, index: number) => (
          <span
            onClick={() => setTab(item)}
            key={index}
            className={
              item === tab
                ? 'ml-2 rounded-full border border-[#FFFFFF] bg-[#334155] px-6 py-2 text-sm font-[500] font-[700] text-[#FFFFFF]	'
                : 'ml-2 rounded-full border border-[#E2E8F0] px-6 py-2 text-sm font-[500] font-[700] text-[#334155]	'
            }
          >
            {item}
          </span>
        ))} */}

        <Tabs.Root defaultValue="All">
          <div className="flex">
            {arrState.map((item, index: number) => (
              // <span>
              <Tabs.List
                key={index}
                onClick={() => setTab(item)}
                className={
                  item === tab
                    ? 'ml-2 rounded-full border border-[#FFFFFF] bg-[#334155] px-6 py-2 text-sm font-[500] font-[700] text-[#FFFFFF]	'
                    : 'ml-2 rounded-full border border-[#E2E8F0] px-6 py-2 text-sm font-[500] font-[700] text-[#334155]	'
                }
              >
                <Tabs.Trigger value={item}>{item}</Tabs.Trigger>
              </Tabs.List>
              // </span>
            ))}
          </div>
          <Tabs.Content value="All" ref={parent} className="pt-10">
            {todolist?.map((todo) => (
              <li
                key={todo.id}
                className="pb-3"
                onClick={() =>
                  updateStatusTodo({
                    todoId: todo.id,
                    status:
                      todo.status == 'completed' ? 'pending' : 'completed',
                  })
                }
              >
                <div className="relative flex items-center rounded-12 border border-gray-200 px-4 py-3 shadow-sm">
                  <Checkbox.Root
                    id={String(todo.id)}
                    checked={todo.status === 'completed' ? true : false}
                    className="flex h-6 w-6 items-center justify-center rounded-6 border border-gray-300 focus:border-gray-700 focus:outline-none data-[state=checked]:border-gray-700 data-[state=checked]:bg-gray-700"
                  >
                    <Checkbox.Indicator>
                      <CheckIcon className="h-4 w-4 text-white" />
                    </Checkbox.Indicator>
                  </Checkbox.Root>

                  <label
                    className="block pl-3 font-medium"
                    htmlFor={String(todo.id)}
                  >
                    {todo.status === 'completed' ? (
                      <del> {todo.body}</del>
                    ) : (
                      todo.body
                    )}
                  </label>
                  <XMarkIcon
                    className="absolute right-3 cursor-pointer"
                    width={24}
                    onClick={() => {
                      deleteTodo({ id: todo.id })
                      setTodoList(
                        todolist?.filter((item) => item.id !== todo.id)
                      )
                    }}
                  />
                </div>
              </li>
            ))}
          </Tabs.Content>
          <Tabs.Content value="Pending" ref={parent} className="pt-10">
            {(todolist ?? todos)
              .filter((item) => item.status == 'pending')
              .map((todo) => (
                <li
                  key={todo.id}
                  className="pb-3 "
                  onClick={() =>
                    updateStatusTodo({ todoId: todo.id, status: 'completed' })
                  }
                >
                  <div className="relative flex items-center rounded-12 border border-gray-200 px-4 py-3 shadow-sm">
                    <Checkbox.Root
                      id={String(todo.id)}
                      className="flex h-6 w-6 items-center justify-center rounded-6 border border-gray-300 focus:border-gray-700 focus:outline-none data-[state=checked]:border-gray-700 data-[state=checked]:bg-gray-700"
                    >
                      <Checkbox.Indicator>
                        <CheckIcon className="h-4 w-4 text-white" />
                      </Checkbox.Indicator>
                    </Checkbox.Root>

                    <label
                      className="block pl-3 font-medium"
                      htmlFor={String(todo.id)}
                    >
                      {todo.body}
                    </label>
                    <XMarkIcon
                      className="absolute right-3 cursor-pointer"
                      width={24}
                      onClick={() => {
                        deleteTodo({ id: todo.id })
                        setTodoList(
                          todolist?.filter((item) => item.id !== todo.id)
                        )
                      }}
                    />
                  </div>
                </li>
              ))}
          </Tabs.Content>
          <Tabs.Content value="Completed" ref={parent} className="pt-10">
            {(todolist ?? todos)
              .filter((item) => item.status == 'completed')
              .map((todo) => (
                <li
                  key={todo.id}
                  className="pb-3 "
                  onClick={() =>
                    updateStatusTodo({ todoId: todo.id, status: 'completed' })
                  }
                >
                  <div className="relative flex items-center rounded-12 border border-gray-200 px-4 py-3 shadow-sm">
                    <Checkbox.Root
                      checked={todo.status === 'completed' ? true : false}
                      id={String(todo.id)}
                      className="flex h-6 w-6 items-center justify-center rounded-6 border border-gray-300 focus:border-gray-700 focus:outline-none data-[state=checked]:border-gray-700 data-[state=checked]:bg-gray-700"
                    >
                      <Checkbox.Indicator>
                        <CheckIcon className="h-4 w-4 text-white" />
                      </Checkbox.Indicator>
                    </Checkbox.Root>

                    <label
                      className="block pl-3 font-medium"
                      htmlFor={String(todo.id)}
                    >
                      {todo.status === 'completed' ? (
                        <del> {todo.body}</del>
                      ) : (
                        todo.body
                      )}
                    </label>
                    <XMarkIcon
                      className="absolute right-3 cursor-pointer"
                      width={24}
                      onClick={() => {
                        deleteTodo({ id: todo.id })
                        setTodoList(
                          todolist?.filter((item) => item.id !== todo.id)
                        )
                      }}
                    />
                  </div>
                </li>
              ))}
          </Tabs.Content>
        </Tabs.Root>
      </div>
      {/* 
      {tab === 'All'
        ? todolist?.map((todo) => (
            <li
              key={todo.id}
              onClick={() =>
                updateStatusTodo({
                  todoId: todo.id,
                  status: todo.status == 'completed' ? 'pending' : 'completed',
                })
              }
            >
              <div className="relative flex items-center rounded-12 border border-gray-200 px-4 py-3 shadow-sm">
                <Checkbox.Root
                  id={String(todo.id)}
                  className="flex h-6 w-6 items-center justify-center rounded-6 border border-gray-300 focus:border-gray-700 focus:outline-none data-[state=checked]:border-gray-700 data-[state=checked]:bg-gray-700"
                >
                  <Checkbox.Indicator>
                    <CheckIcon className="h-4 w-4 text-white" />
                  </Checkbox.Indicator>
                </Checkbox.Root>

                <label
                  className="block pl-3 font-medium"
                  htmlFor={String(todo.id)}
                >
                  {todo.status === 'completed' ? (
                    <del> {todo.body}</del>
                  ) : (
                    todo.body
                  )}{' '}
                </label>
                <XMarkIcon
                  className="absolute right-3 cursor-pointer"
                  width={24}
                  onClick={() => {
                    deleteTodo({ id: todo.id })
                    setTodoList(todolist?.filter((item) => item.id !== todo.id))
                  }}
                />
              </div>
            </li>
          ))
        : tab === 'Pending'
        ? (todolist ?? todos)
            .filter((item) => item.status == 'pending')
            .map((todo) => (
              <li
                key={todo.id}
                onClick={() =>
                  updateStatusTodo({ todoId: todo.id, status: 'completed' })
                }
              >
                <div className="relative flex items-center rounded-12 border border-gray-200 px-4 py-3 shadow-sm">
                  <Checkbox.Root
                    id={String(todo.id)}
                    className="flex h-6 w-6 items-center justify-center rounded-6 border border-gray-300 focus:border-gray-700 focus:outline-none data-[state=checked]:border-gray-700 data-[state=checked]:bg-gray-700"
                  >
                    <Checkbox.Indicator>
                      <CheckIcon className="h-4 w-4 text-white" />
                    </Checkbox.Indicator>
                  </Checkbox.Root>

                  <label
                    className="block pl-3 font-medium"
                    htmlFor={String(todo.id)}
                  >
                    {todo.body}
                  </label>
                  <XMarkIcon
                    className="absolute right-3 cursor-pointer"
                    width={24}
                    onClick={() => {
                      deleteTodo({ id: todo.id })
                      setTodoList(
                        todolist?.filter((item) => item.id !== todo.id)
                      )
                    }}
                  />
                </div>
              </li>
            ))
        : (todolist ?? todos)
            .filter((item) => item.status == 'completed')
            .map((todo) => (
              <li
                key={todo.id}
                onClick={() =>
                  updateStatusTodo({ todoId: todo.id, status: 'completed' })
                }
              >
                <div className="relative flex items-center rounded-12 border border-gray-200 px-4 py-3 shadow-sm">
                  <Checkbox.Root
                    id={String(todo.id)}
                    className="flex h-6 w-6 items-center justify-center rounded-6 border border-gray-300 focus:border-gray-700 focus:outline-none data-[state=checked]:border-gray-700 data-[state=checked]:bg-gray-700"
                  >
                    <Checkbox.Indicator>
                      <CheckIcon className="h-4 w-4 text-white" />
                    </Checkbox.Indicator>
                  </Checkbox.Root>

                  <label
                    className="block pl-3 font-medium"
                    htmlFor={String(todo.id)}
                  >
                    {todo.status === 'completed' ? (
                      <del> {todo.body}</del>
                    ) : (
                      todo.body
                    )}
                  </label>
                  <XMarkIcon
                    className="absolute right-3 cursor-pointer"
                    width={24}
                    onClick={() => {
                      deleteTodo({ id: todo.id })
                      setTodoList(
                        todolist?.filter((item) => item.id !== todo.id)
                      )
                    }}
                  />
                </div>
              </li>
            ))} */}
    </ul>
  )
}

const XMarkIcon = (props: SVGProps<SVGSVGElement>) => {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
      strokeWidth={1.5}
      stroke="currentColor"
      {...props}
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M6 18L18 6M6 6l12 12"
      />
    </svg>
  )
}

const CheckIcon = (props: SVGProps<SVGSVGElement>) => {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
      strokeWidth={1.5}
      stroke="currentColor"
      {...props}
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M4.5 12.75l6 6 9-13.5"
      />
    </svg>
  )
}
