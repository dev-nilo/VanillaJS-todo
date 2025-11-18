document.addEventListener("DOMContentLoaded", function () {
  const form = document.getElementById("taskForm");
  const input = document.getElementById("taskInput");
  const taskList = document.getElementById("taskList");
  const pendingCountSpan = document.getElementById("pendingCount");
  const searchInput = document.getElementById("searchTaskInput");

  // Constante para a chave do localStorage
  const STORAGE_KEY = "tasks";

  // --- Funções de Persistência e Utilitários ---

  /**
   * Atualiza o contador de tarefas pendentes.
   */
  function updatePendingCount() {
    // Conta quantos itens LI NÃO possuem a classe 'completed'
    const pendingTasks = taskList.querySelectorAll("li:not(.completed)").length;
    pendingCountSpan.textContent = pendingTasks;
  }

  /**
   * Salva TODAS as tarefas (texto e status de conclusão) no localStorage.
   * Não deve ser afetada pelo filtro (display: none).
   */
  function saveTasks() {
    const tasks = [];
    taskList.querySelectorAll("li").forEach((li) => {
      // Pega o texto do parágrafo da tarefa
      const taskTextElement = li.querySelector("p");

      // Verifica a existência do elemento para segurança
      if (taskTextElement) {
        const taskText = taskTextElement.textContent;
        const isCompleted = li.classList.contains("completed");

        tasks.push({
          text: taskText,
          completed: isCompleted,
        });
      }
    });
    localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks));
    updatePendingCount();
  }

  /**
   * Cria o elemento LI completo.
   * Não anexa listeners, que serão tratados por delegação.
   */
  function createTaskElement(taskText, isCompleted = false) {
    const li = document.createElement("li");
    const p = document.createElement("p");
    const deleteIcon = document.createElement("i");

    p.textContent = taskText;

    // Adiciona uma classe para o parágrafo ser o alvo do clique (delegação)
    p.classList.add("task-text");

    if (isCompleted) {
      li.classList.add("completed");
    }

    // Configuração do Ícone (Font Awesome)
    deleteIcon.classList.add("fa-solid", "fa-trash", "delete-btn");
    deleteIcon.setAttribute("role", "button");
    deleteIcon.setAttribute("aria-label", `Deletar tarefa: ${taskText}`); // Acessibilidade

    li.appendChild(p);
    li.appendChild(deleteIcon);

    return li;
  }

  /**
   * Carrega as tarefas salvas no localStorage.
   */
  function loadTasks() {
    const tasksStr = localStorage.getItem(STORAGE_KEY);

    if (tasksStr) {
      try {
        const tasks = JSON.parse(tasksStr);

        tasks.forEach((task) => {
          const li = createTaskElement(task.text, task.completed);
          taskList.appendChild(li);
        });
      } catch (e) {
        console.error("Erro ao carregar tarefas do localStorage:", e);
        // Opcional: Limpar localStorage se o JSON for inválido
        localStorage.removeItem(STORAGE_KEY);
      }
    }
    updatePendingCount();
  }

  /**
   * Filtra os itens da lista baseados no texto de pesquisa.
   */
  function filterTasks() {
    const searchTerm = searchInput.value.trim().toLowerCase();

    taskList.querySelectorAll("li").forEach((li) => {
      const taskText = li.querySelector("p")?.textContent.toLowerCase() || "";

      // Se o texto da tarefa incluir o termo de pesquisa, mostra o item
      if (taskText.includes(searchTerm)) {
        li.style.display = "flex";
      } else {
        li.style.display = "none";
      }
    });
  }

  // --- Inicialização e Event Listeners Principais ---

  // 1. Carrega tarefas e atualiza contador
  loadTasks();

  // 2. Adicionar Tarefa
  form.addEventListener("submit", (e) => {
    e.preventDefault();

    const taskText = input.value.trim();
    if (taskText !== "") {
      const li = createTaskElement(taskText);
      taskList.appendChild(li);
      input.value = "";
      saveTasks();
      // Garante que a nova tarefa seja visível (se o filtro for 'vazio')
      filterTasks();
    }
  });

  // 3. Delegação de Eventos: Conclusão e Exclusão de Tarefa
  taskList.addEventListener("click", (e) => {
    const target = e.target;

    // Ação de Exclusão
    if (target.classList.contains("delete-btn")) {
      const liToRemove = target.closest("li");
      if (liToRemove) {
        taskList.removeChild(liToRemove);
        saveTasks();
      }
      return; // Sai após a exclusão
    }

    // Ação de Marcar como Concluída (Pelo clique no texto <p>)
    if (target.classList.contains("task-text")) {
      const liToToggle = target.closest("li");
      if (liToToggle) {
        liToToggle.classList.toggle("completed");
        saveTasks();
      }
    }
  });

  // 4. Pesquisar Tarefas (Input Event)
  searchInput.addEventListener("input", filterTasks);
});
