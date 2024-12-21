import React from 'react';
import { Todo } from '../types/Todo';
import { TodoItem } from './TodoItem';

interface Props {
  todos: Todo[];
  onUpdate: (v: Todo) => void;
  onDelete: (n: number) => void;
  loader: boolean;
  massLoader: boolean;
  tempTodo?: Todo | null;
}

export const TodoList: React.FC<Props> = ({
  todos,
  onUpdate,
  onDelete,
  loader,
  massLoader,
  tempTodo = null,
}) => {
  return (
    <section className="todoapp__main" data-cy="TodoList">
      {todos.map(todo => (
        <TodoItem
          key={todo.id}
          todo={todo}
          onUpdate={onUpdate}
          onDelete={onDelete}
          loader={loader}
          massLoader={massLoader}
        />
      ))}

      {tempTodo && (
        <TodoItem
          todo={tempTodo}
          onUpdate={onUpdate}
          onDelete={onDelete}
          loader={loader}
          massLoader={massLoader}
          tempTodo={tempTodo}
        />
      )}
    </section>
  );
};
